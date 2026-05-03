onRecordAfterCreateSuccess((e) => {
  const notifCol = $app.findCollectionByNameOrId('notifications')
  const notif = new Record(notifCol)
  notif.set('user', e.record.id)
  notif.set('type', 'email')
  notif.set('subject', 'Bem-vindo ao App Paciente Saudável!')
  notif.set(
    'message',
    'Sua conta foi criada. Acesse o sistema e configure sua senha através do link de recuperação.',
  )
  notif.set('status', 'enviado')
  notif.set('sent_at', new Date().toISOString())
  $app.save(notif)
  e.next()
}, 'users')
