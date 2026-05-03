migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUser = (email, password, role, name) => {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword(password)
        record.setVerified(true)
        record.set('role', role)
        record.set('name', name)
        app.save(record)
      }
    }

    seedUser('admin@canever.com.br', 'senha123', 'admin', 'Dr. Márcio Canever')
    seedUser('financeiro@canever.com.br', 'senha123', 'financeiro', 'Financeiro Canever')
  },
  (app) => {
    try {
      const r1 = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@canever.com.br')
      app.delete(r1)
    } catch (_) {}
    try {
      const r2 = app.findAuthRecordByEmail('_pb_users_auth_', 'financeiro@canever.com.br')
      app.delete(r2)
    } catch (_) {}
  },
)
