migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const assinaturas = app.findCollectionByNameOrId('assinaturas')

    // 1. Seed for admin
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@canever.com.br')
      try {
        app.findFirstRecordByData('assinaturas', 'usuario_id', admin.id)
      } catch (_) {
        const record = new Record(assinaturas)
        record.set('usuario_id', admin.id)
        record.set('plano', 'Plano Premium')
        record.set('status', 'ativa')
        record.set('data_inicio', new Date().toISOString().split('T')[0] + ' 12:00:00.000Z')
        record.set(
          'data_renovacao',
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] +
            ' 12:00:00.000Z',
        )
        app.save(record)
      }
    } catch (_) {}

    // 2. Seed for dummy patient
    let dummyId = ''
    try {
      const dummy = app.findAuthRecordByEmail('_pb_users_auth_', 'paciente@teste.com')
      dummyId = dummy.id
    } catch (_) {
      const dummy = new Record(users)
      dummy.setEmail('paciente@teste.com')
      dummy.setPassword('Skip@Pass')
      dummy.setVerified(true)
      dummy.set('name', 'Paciente Teste')
      app.save(dummy)
      dummyId = dummy.id
    }

    try {
      app.findFirstRecordByData('assinaturas', 'usuario_id', dummyId)
    } catch (_) {
      const record = new Record(assinaturas)
      record.set('usuario_id', dummyId)
      record.set('plano', 'Plano Essencial')
      record.set('status', 'ativa')
      record.set('data_inicio', new Date().toISOString().split('T')[0] + ' 12:00:00.000Z')
      record.set(
        'data_renovacao',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] +
          ' 12:00:00.000Z',
      )
      app.save(record)
    }
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@canever.com.br')
      const sub = app.findFirstRecordByData('assinaturas', 'usuario_id', admin.id)
      app.delete(sub)
    } catch (_) {}

    try {
      const dummy = app.findAuthRecordByEmail('_pb_users_auth_', 'paciente@teste.com')
      try {
        const sub = app.findFirstRecordByData('assinaturas', 'usuario_id', dummy.id)
        app.delete(sub)
      } catch (_) {}
      app.delete(dummy)
    } catch (_) {}
  },
)
