migrate(
  (app) => {
    const subsCol = app.findCollectionByNameOrId('subscriptions')

    const collection = new Collection({
      name: 'payments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'subscription',
          type: 'relation',
          required: true,
          collectionId: subsCol.id,
          maxSelect: 1,
        },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'processando', 'aprovado', 'recusado', 'reembolsado'],
          maxSelect: 1,
        },
        {
          name: 'method',
          type: 'select',
          required: true,
          values: ['cartao_credito', 'pix', 'boleto'],
          maxSelect: 1,
        },
        { name: 'gateway_id', type: 'text' },
        { name: 'payment_date', type: 'date' },
        { name: 'next_renewal', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_payments_user ON payments (user)',
        'CREATE INDEX idx_payments_subscription ON payments (subscription)',
        'CREATE INDEX idx_payments_status ON payments (status)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('payments')
      app.delete(collection)
    } catch (_) {}
  },
)
