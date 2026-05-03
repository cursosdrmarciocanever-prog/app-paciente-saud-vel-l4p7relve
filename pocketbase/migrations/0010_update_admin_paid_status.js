migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      record.set('is_paid', true)
      app.save(record)
    } catch (_) {}
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      record.set('is_paid', false)
      app.save(record)
    } catch (_) {}
  },
)
