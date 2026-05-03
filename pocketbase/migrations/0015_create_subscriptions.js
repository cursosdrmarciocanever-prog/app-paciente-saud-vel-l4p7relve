migrate(
  (app) => {
    const collection = new Collection({
      name: 'subscriptions',
      type: 'base',
      listRule:
        "@request.auth.role = 'admin' || @request.auth.role = 'financeiro' || (@request.auth.id != '' && user = @request.auth.id)",
      viewRule:
        "@request.auth.role = 'admin' || @request.auth.role = 'financeiro' || (@request.auth.id != '' && user = @request.auth.id)",
      createRule:
        "@request.auth.role = 'admin' || (@request.auth.id != '' && user = @request.auth.id)",
      updateRule:
        "@request.auth.role = 'admin' || (@request.auth.id != '' && user = @request.auth.id)",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'plan',
          type: 'select',
          required: true,
          values: ['entry', 'intermediate', 'premium', 'diamond'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['active', 'pending_payment', 'canceled', 'suspended'],
          maxSelect: 1,
        },
        { name: 'start_date', type: 'date' },
        { name: 'renewal_date', type: 'date' },
        { name: 'monthly_price', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('subscriptions')
    app.delete(collection)
  },
)
