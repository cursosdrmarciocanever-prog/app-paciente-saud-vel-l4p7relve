migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
    } catch (_) {
      return
    }

    let medico
    try {
      medico = app.findAuthRecordByEmail('_pb_users_auth_', 'medico@example.com')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      medico = new Record(users)
      medico.setEmail('medico@example.com')
      medico.setPassword('Skip@Pass')
      medico.setVerified(true)
      medico.set('name', 'Dr. Médico')
      app.save(medico)
    }

    const slots = app.findCollectionByNameOrId('slots_disponiveis')
    let slotId = null
    try {
      const existingSlot = app.findFirstRecordByData('slots_disponiveis', 'hora_inicio', '10:00')
      slotId = existingSlot.id
    } catch (_) {
      const slot1 = new Record(slots)
      slot1.set('data', '2026-06-01 10:00:00.000Z')
      slot1.set('hora_inicio', '10:00')
      slot1.set('hora_fim', '11:00')
      slot1.set('medico_id', medico.id)
      slot1.set('agendado', true)
      app.save(slot1)
      slotId = slot1.id

      const slot2 = new Record(slots)
      slot2.set('data', '2026-06-02 10:00:00.000Z')
      slot2.set('hora_inicio', '14:00')
      slot2.set('hora_fim', '15:00')
      slot2.set('medico_id', medico.id)
      slot2.set('agendado', false)
      app.save(slot2)
    }

    try {
      app.findFirstRecordByData('agendamentos', 'usuario_id', user.id)
    } catch (_) {
      const agendamentos = app.findCollectionByNameOrId('agendamentos')
      const ag = new Record(agendamentos)
      ag.set('usuario_id', user.id)
      ag.set('slot_id', slotId)
      ag.set('data_agendamento', '2026-06-01 10:00:00.000Z')
      ag.set('hora_agendamento', '10:00')
      ag.set('status', 'confirmado')
      ag.set('tipo_consulta', 'telemedicina')
      ag.set('notas', 'Primeira consulta de rotina')
      app.save(ag)
    }

    try {
      app.findFirstRecordByData('historico_elegibilidade', 'usuario_id', user.id)
    } catch (_) {
      const hist = app.findCollectionByNameOrId('historico_elegibilidade')
      const h = new Record(hist)
      h.set('usuario_id', user.id)
      h.set('consultas_realizadas_ano', 0)
      h.set('proxima_consulta_permitida', '2026-06-01 10:00:00.000Z')
      app.save(h)
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      const agendamentos = app.findRecordsByFilter(
        'agendamentos',
        `usuario_id = "${user.id}"`,
        '',
        10,
        0,
      )
      agendamentos.forEach((a) => app.delete(a))
      const historicos = app.findRecordsByFilter(
        'historico_elegibilidade',
        `usuario_id = "${user.id}"`,
        '',
        10,
        0,
      )
      historicos.forEach((h) => app.delete(h))
    } catch (_) {}
  },
)
