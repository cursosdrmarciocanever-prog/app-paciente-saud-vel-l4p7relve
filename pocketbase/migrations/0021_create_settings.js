migrate(
  (app) => {
    const collection = new Collection({
      name: 'settings',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'max_daily_presencial', type: 'number', required: true, min: 0, onlyInt: true },
        { name: 'max_daily_telemedicina', type: 'number', required: true, min: 0, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')
    app.delete(collection)
  },
)
