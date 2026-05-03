onRecordAfterCreateSuccess((e) => {
  const notifCol = $app.findCollectionByNameOrId('notifications')
  const notif = new Record(notifCol)
  notif.set('user', e.record.getString('user'))
  notif.set('type', 'whatsapp')
  notif.set('subject', 'Nova Consulta Agendada')
  notif.set(
    'message',
    `Você tem uma nova consulta agendada para ${e.record.getString('date')}. Prepare-se para nossa sessão!`,
  )
  notif.set('status', 'enviado')
  notif.set('sent_at', new Date().toISOString())
  $app.save(notif)
  e.next()
}, 'appointments')

onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = record.original()
  if (record.getString('status') === 'cancelado' && original.getString('status') !== 'cancelado') {
    const notifCol = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCol)
    notif.set('user', record.getString('user'))
    notif.set('type', 'whatsapp')
    notif.set('subject', 'Consulta Cancelada')
    notif.set(
      'message',
      `Sua consulta do dia ${record.getString('date')} foi cancelada. Entre em contato para reagendar.`,
    )
    notif.set('status', 'enviado')
    notif.set('sent_at', new Date().toISOString())
    $app.save(notif)
  }
  e.next()
}, 'appointments')
