onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()
  if (record.getString('status') === 'canceled' && original.getString('status') !== 'canceled') {
    const notifCol = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCol)
    notif.set('user', record.getString('user'))
    notif.set('type', 'email')
    notif.set('subject', 'Confirmação de Cancelamento de Assinatura')
    notif.set('message', 'Sua assinatura foi cancelada com sucesso. Lamentamos ver você partir!')
    notif.set('status', 'enviado')
    notif.set('sent_at', new Date().toISOString())
    $app.save(notif)
  }
  e.next()
}, 'subscriptions')
