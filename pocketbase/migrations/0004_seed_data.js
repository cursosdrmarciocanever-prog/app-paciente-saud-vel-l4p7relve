migrate(
  (app) => {
    const user = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')

    const bioCol = app.findCollectionByNameOrId('bioimpedance')
    try {
      app.findFirstRecordByData('bioimpedance', 'notes', 'Avaliação Inicial')
    } catch (_) {
      const rec1 = new Record(bioCol)
      rec1.set('user', user.id)
      rec1.set('date', '2023-01-10 12:00:00.000Z')
      rec1.set('notes', 'Avaliação Inicial')
      app.save(rec1)

      const rec2 = new Record(bioCol)
      rec2.set('user', user.id)
      rec2.set('date', '2023-02-10 12:00:00.000Z')
      rec2.set('notes', 'Acompanhamento Mês 1')
      app.save(rec2)
    }

    const photoCol = app.findCollectionByNameOrId('evolution_photos')
    try {
      app.findFirstRecordByData('evolution_photos', 'angle', 'Frente')
    } catch (_) {
      const p1 = new Record(photoCol)
      p1.set('user', user.id)
      p1.set('date', '2023-01-10 12:00:00.000Z')
      p1.set('angle', 'Frente')
      app.save(p1)

      const p2 = new Record(photoCol)
      p2.set('user', user.id)
      p2.set('date', '2023-01-10 12:00:00.000Z')
      p2.set('angle', 'Lado')
      app.save(p2)

      const p3 = new Record(photoCol)
      p3.set('user', user.id)
      p3.set('date', '2023-01-10 12:00:00.000Z')
      p3.set('angle', 'Costas')
      app.save(p3)
    }
  },
  (app) => {
    // down
  },
)
