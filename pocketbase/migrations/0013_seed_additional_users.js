migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUser = (email, name, password) => {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword(password)
        record.setVerified(true)
        record.set('name', name)
        app.save(record)
      }
    }

    seedUser('admin@canever.com.br', 'Dr. Márcio Canever', 'senha123')
    seedUser('financeiro@canever.com.br', 'Financeiro Canever', 'senha123')
  },
  (app) => {
    const emails = ['admin@canever.com.br', 'financeiro@canever.com.br']
    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
