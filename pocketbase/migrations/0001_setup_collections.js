migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)

    const assinaturas = new Collection({
      name: 'assinaturas',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'plano', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_renovacao', type: 'date' },
        { name: 'stripe_subscription_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_assinaturas_usuario_id ON assinaturas (usuario_id)'],
    })
    app.save(assinaturas)
  },
  (app) => {
    try {
      const assinaturas = app.findCollectionByNameOrId('assinaturas')
      app.delete(assinaturas)
    } catch (_) {}
  },
)
