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
