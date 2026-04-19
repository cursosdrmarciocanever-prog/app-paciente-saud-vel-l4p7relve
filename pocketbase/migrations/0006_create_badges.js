migrate(
  (app) => {
    const badges = new Collection({
      name: 'badges',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        {
          name: 'icon',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['streak_days', 'total_activities', 'weekly_goals_met', 'first_log'],
          maxSelect: 1,
        },
        { name: 'requirement_value', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_badges_type ON badges (type)'],
    })
    app.save(badges)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const userBadges = new Collection({
      name: 'user_badges',
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
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'badge',
          type: 'relation',
          required: true,
          collectionId: badges.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'earned_at', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_user_badges_user ON user_badges (user)'],
    })
    app.save(userBadges)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_badges'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('badges'))
    } catch (_) {}
  },
)
