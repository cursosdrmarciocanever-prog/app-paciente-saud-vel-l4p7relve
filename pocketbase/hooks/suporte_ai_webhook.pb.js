routerAdd('POST', '/backend/v1/suporte/webhook', (e) => {
  const body = e.requestInfo().body
  if (!body.conversa_id || !body.conteudo) {
    return e.badRequestError('Missing conversa_id or conteudo')
  }

  try {
    const conversa = $app.findRecordById('conversas_suporte', body.conversa_id)
    const mensagens = $app.findCollectionByNameOrId('mensagens_suporte')
    const record = new Record(mensagens)

    record.set('conversa_id', conversa.id)
    record.set('usuario_id', conversa.getString('usuario_id'))
    record.set('remetente', 'agente_ia')
    record.set('conteudo', body.conteudo)

    $app.save(record)

    return e.json(200, { success: true, message_id: record.id })
  } catch (error) {
    return e.internalServerError('Failed to process webhook')
  }
})
