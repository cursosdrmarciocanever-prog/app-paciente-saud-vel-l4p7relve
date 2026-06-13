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

  // Obter a URL do webhook do n8n dos segredos
  const webhookUrl = $secrets.get('N8N_WEBHOOK_URL')
  if (!webhookUrl) {
    $app.logger().error('N8N_WEBHOOK_URL secret not found')
    return e.next()
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
      }),
      timeout: 15,
    })
  } catch (err) {
    $app.logger().error('Error sending to n8n', 'error', String(err))
  }

  return e.next()
}, 'mensagens_suporte')
