onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.getString('remetente') !== 'paciente') {
    return e.next()
  }

  // Atualizar o 'updated' da conversa para refletir a nova mensagem
  try {
    const conversaId = record.getString('conversa_id')
    const now = new Date().toISOString().replace('T', ' ')
    $app
      .db()
      .newQuery('UPDATE conversas_suporte SET updated = {:now} WHERE id = {:id}')
      .bind({ now: now, id: conversaId })
      .execute()
  } catch (err) {
    $app.logger().error('Error updating conversa', 'error', String(err))
  }

  // Obter a URL do webhook do n8n da env (PocketBase self-hosted usa $os.getenv, não $secrets)
  const webhookUrl = $os.getenv('N8N_WEBHOOK_URL')
  if (!webhookUrl) {
    $app.logger().error('N8N_WEBHOOK_URL secret not found')
    return e.next()
  }

  // Descobrir qual agente atende esta conversa e o nome do paciente (inline,
  // pois o handler do JSVM roda isolado e não enxerga funções externas)
  let agente = 'geral'
  let nome = 'paciente'
  try {
    const conversa = $app.findRecordById('conversas_suporte', record.getString('conversa_id'))
    const a = conversa.getString('agente')
    if (a) agente = a
  } catch (err) {
    $app.logger().error('Error loading conversa agente', 'error', String(err))
  }
  try {
    const paciente = $app.findRecordById('users', record.getString('usuario_id'))
    const n = paciente.getString('name')
    if (n) nome = n
  } catch (err) {
    /* segue com 'paciente' */
  }

  // Montar o HISTÓRICO da conversa para a IA ter memória (senão entra em loop na
  // anamnese). Pega as últimas 30 mensagens em ordem cronológica (a mensagem
  // recém-criada já está salva e entra como a última).
  let historico = []
  try {
    const msgs = $app.findRecordsByFilter(
      'mensagens_suporte',
      'conversa_id = "' + record.getString('conversa_id') + '"',
      '-created',
      30,
      0,
    )
    for (const m of msgs) {
      // String() é necessário: o valor de getString em registros de
      // findRecordsByFilter não bate com === estrito (proxy do Go).
      const rem = String(m.getString('remetente'))
      historico.push({
        role: rem === 'paciente' ? 'user' : 'assistant',
        content: String(m.getString('conteudo')),
      })
    }
    // msgs vem em ordem decrescente (mais nova primeiro). reverter o ARRAY JS
    // (historico) funciona; msgs.reverse() é no-op (proxy do Go).
    historico.reverse()
  } catch (err) {
    $app.logger().error('Error building historico', 'error', String(err))
  }

  // Trava de uso: agentes ESPECIALISTAS (pagos) têm limite mensal de mensagens.
  // O agente 'geral' (grátis) não é limitado.
  const ESPECIALISTAS = ['nutricional', 'exames', 'medico']
  if (ESPECIALISTAS.indexOf(agente) >= 0) {
    const usuarioId = record.getString('usuario_id')
    const mes = new Date().toISOString().slice(0, 7) // "YYYY-MM"

    // plano do paciente (assinatura ativa) → fallback "default"
    let plano = 'default'
    try {
      const ass = $app.findRecordsByFilter(
        'assinaturas',
        'usuario_id = "' + usuarioId + '" && (status = "ativo" || status = "active" || status = "ativa")',
        '-created',
        1,
        0,
      )
      if (ass && ass.length > 0) {
        const p = String(ass[0].getString('plano') || '').trim()
        if (p) plano = p
      }
    } catch (err) {
      $app.logger().error('SUPORTE limite assinatura', 'error', String(err))
    }

    let limiteMsgs = 150 // fallback
    try {
      let lim = $app.findRecordsByFilter('limites_plano', 'plano = "' + plano + '"', '', 1, 0)
      if (!lim || lim.length === 0) lim = $app.findRecordsByFilter('limites_plano', 'plano = "default"', '', 1, 0)
      if (lim && lim.length > 0) limiteMsgs = Number(lim[0].getInt('limite_mensagens'))
    } catch (err) {
      $app.logger().error('SUPORTE limite lookup', 'error', String(err))
    }

    let usoRec = null
    let msgsUsadas = 0
    try {
      const recs = $app.findRecordsByFilter(
        'uso_ia',
        'usuario_id = "' + usuarioId + '" && mes = "' + mes + '"',
        '',
        1,
        0,
      )
      if (recs && recs.length > 0) {
        usoRec = recs[0]
        msgsUsadas = Number(usoRec.getInt('mensagens_ia')) || 0
      }
    } catch (err) {
      $app.logger().error('SUPORTE uso lookup', 'error', String(err))
    }

    if (limiteMsgs > 0 && msgsUsadas >= limiteMsgs) {
      // Limite atingido → NÃO chama o n8n; cria uma resposta automática.
      // (A mensagem nova tem remetente 'agente_ia', então este hook a ignora — sem loop.)
      try {
        const col = $app.findCollectionByNameOrId('mensagens_suporte')
        const aviso = new Record(col)
        aviso.set('conversa_id', record.getString('conversa_id'))
        aviso.set('usuario_id', usuarioId)
        aviso.set('remetente', 'agente_ia')
        aviso.set(
          'conteudo',
          'Você atingiu o limite de ' +
            limiteMsgs +
            ' mensagens com os assistentes especialistas neste mês. O limite renova no início do próximo mês.',
        )
        $app.save(aviso)
      } catch (err) {
        $app.logger().error('SUPORTE aviso limite', 'error', String(err))
      }
      return e.next()
    }

    // Dentro do limite → soma +1 (cria a linha do mês se preciso).
    try {
      if (usoRec) {
        usoRec.set('mensagens_ia', msgsUsadas + 1)
        $app.save(usoRec)
      } else {
        const col = $app.findCollectionByNameOrId('uso_ia')
        const novo = new Record(col)
        novo.set('usuario_id', usuarioId)
        novo.set('mes', mes)
        novo.set('mensagens_ia', 1)
        novo.set('fotos_analisadas', 0)
        $app.save(novo)
      }
    } catch (err) {
      $app.logger().error('SUPORTE incremento uso', 'error', String(err))
    }
  }

  // Enviar os dados da mensagem para o n8n em background
  try {
    $http.send({
      url: webhookUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversa_id: record.getString('conversa_id'),
        usuario_id: record.getString('usuario_id'),
        conteudo: record.getString('conteudo'),
        timestamp: record.getString('created'),
        agente: agente,
        nome: nome,
        historico: historico,
      }),
      timeout: 15,
    })
  } catch (err) {
    $app.logger().error('Error sending to n8n', 'error', String(err))
  }

  return e.next()
}, 'mensagens_suporte')
