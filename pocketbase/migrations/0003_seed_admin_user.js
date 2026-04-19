migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('marciocanever@hotmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Márcio Canever')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
