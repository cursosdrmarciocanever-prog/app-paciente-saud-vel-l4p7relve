migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('weekly_goal')) {
      users.fields.add(new NumberField({ name: 'weekly_goal', min: 1, max: 7 }))
    }
    if (!users.fields.getByName('daily_goal_minutes')) {
      users.fields.add(new NumberField({ name: 'daily_goal_minutes', min: 1 }))
    }
    if (!users.fields.getByName('is_paid')) {
      users.fields.add(new BoolField({ name: 'is_paid' }))
    }

    app.save(users)

    const activity = new Collection({
      name: 'physical_activity',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'date', type: 'date', required: true },
        { name: 'duration_minutes', type: 'number', required: true, min: 1 },
        { name: 'activity_type', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(activity)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'marciocanever@hotmail.com')
      admin.set('is_paid', true)
      admin.set('weekly_goal', 5)
      admin.set('daily_goal_minutes', 45)
      app.save(admin)
    } catch (_) {}
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('weekly_goal')
    users.fields.removeByName('daily_goal_minutes')
    users.fields.removeByName('is_paid')
    app.save(users)

    const activity = app.findCollectionByNameOrId('physical_activity')
    app.delete(activity)
  },
)
