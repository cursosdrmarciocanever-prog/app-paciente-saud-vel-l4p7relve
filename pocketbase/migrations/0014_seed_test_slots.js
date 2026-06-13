migrate(
  (app) => {
    try {
      const admin = app.findFirstRecordByData(
        '_pb_users_auth_',
        'email',
        'marciocanever@hotmail.com',
      )
      const slotsCol = app.findCollectionByNameOrId('slots_disponiveis')

      const now = new Date()
      for (let i = 1; i <= 5; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0] + ' 12:00:00.000Z'

        const times = [
          { start: '10:00', end: '11:00' },
          { start: '14:00', end: '15:00' },
        ]

        for (const time of times) {
          try {
            const filter = `data >= "${date.toISOString().split('T')[0]} 00:00:00.000Z" && data <= "${date.toISOString().split('T')[0]} 23:59:59.999Z" && hora_inicio = "${time.start}" && medico_id = "${admin.id}"`
            app.findFirstRecordByFilter('slots_disponiveis', filter)
            continue
          } catch (_) {
            const record = new Record(slotsCol)
            record.set('data', dateStr)
            record.set('hora_inicio', time.start)
            record.set('hora_fim', time.end)
            record.set('medico_id', admin.id)
            record.set('agendado', false)
            record.set('tipo', 'presencial')
            app.save(record)
          }
        }
      }
    } catch (e) {
      console.log('Admin user not found or error:', e)
    }
  },
  (app) => {
    // Revert logic omitted intentionally to preserve existing slots gracefully
  },
)
