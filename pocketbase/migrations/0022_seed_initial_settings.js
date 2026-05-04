migrate(
  (app) => {
    try {
      app.findFirstRecordByFilter('settings', '1=1')
      return // Already seeded
    } catch (_) {}

    const settings = app.findCollectionByNameOrId('settings')
    const record = new Record(settings)
    record.set('max_daily_presencial', 5)
    record.set('max_daily_telemedicina', 10)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByFilter('settings', '1=1')
      app.delete(record)
    } catch (_) {}
  },
)
