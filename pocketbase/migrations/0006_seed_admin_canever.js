migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'admin@canever.com.br')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const record = new Record(users)
      record.setEmail('admin@canever.com.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin Canever')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@canever.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
