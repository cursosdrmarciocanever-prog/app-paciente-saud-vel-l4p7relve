migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')

    // Allow all authenticated users to read settings so the scheduling calendar can use them
    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"

    collection.fields.add(
      new TextField({
        name: 'start_time',
        required: false,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'end_time',
        required: false,
      }),
    )

    app.save(collection)

    // Set default values for existing records
    const records = app.findRecordsByFilter('settings', "id != ''", '', 100, 0)
    for (const record of records) {
      if (!record.getString('start_time')) {
        record.set('start_time', '08:00')
      }
      if (!record.getString('end_time')) {
        record.set('end_time', '18:00')
      }
      app.save(record)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')

    // Revert back to admin-only access
    collection.listRule = "@request.auth.role = 'admin'"
    collection.viewRule = "@request.auth.role = 'admin'"

    collection.fields.removeByName('start_time')
    collection.fields.removeByName('end_time')

    app.save(collection)
  },
)
