/// <reference path="../pb_data/types.d.ts" />

// Pedidos de compra feitos a partir da prateleira (catálogo de injetáveis).
// Paciente compra um item do catalogo_injetaveis; admin acompanha os pedidos.
migrate(
  (app) => {
    const ADMIN =
      "@request.auth.email = 'admin@canever.com.br' || @request.auth.email = 'marciocanever@hotmail.com'"
    const dono = `usuario_id = @request.auth.id || ${ADMIN}`
    const catalogo = app.findCollectionByNameOrId('catalogo_injetaveis')

    const pedidos = new Collection({
      name: 'pedidos_catalogo',
      type: 'base',
      listRule: dono,
      viewRule: dono,
      createRule: `(@request.auth.id != '' && @request.body.usuario_id = @request.auth.id) || ${ADMIN}`,
      updateRule: dono,
      deleteRule: dono,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'catalogo_id',
          type: 'relation',
          required: true,
          collectionId: catalogo.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'produto', type: 'text', required: true, max: 200 },
        { name: 'valor_unitario', type: 'number', required: false },
        { name: 'quantidade', type: 'number', required: true },
        { name: 'total', type: 'number', required: false },
        {
          name: 'status',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['solicitado', 'confirmado', 'cancelado'],
        },
        { name: 'observacao', type: 'text', required: false, max: 1000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pedidos_catalogo_usuario ON pedidos_catalogo (usuario_id, created)',
      ],
    })
    app.save(pedidos)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pedidos_catalogo')
    app.delete(col)
  },
)
