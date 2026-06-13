migrate(
  (app) => {
    const fotosCollection = new Collection({
      name: 'fotos_paciente',
      type: 'base',
      listRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      viewRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      createRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      updateRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      deleteRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
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
          name: 'foto',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'descricao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_fotos_usuario_date ON fotos_paciente (usuario_id, created)'],
    })
    app.save(fotosCollection)

    const examesCollection = new Collection({
      name: 'exames_pdf',
      type: 'base',
      listRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      viewRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      createRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      updateRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      deleteRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome_exame', type: 'text', required: true },
        {
          name: 'arquivo',
          type: 'file',
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'tamanho_bytes', type: 'number' },
        { name: 'data_exame', type: 'date' },
        { name: 'tipo_exame', type: 'select', values: ['sangue', 'imagem', 'outro'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_exames_usuario_data ON exames_pdf (usuario_id, data_exame)'],
    })
    app.save(examesCollection)

    const bioimpedanciaCollection = new Collection({
      name: 'bioimpedancia_pdf',
      type: 'base',
      listRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      viewRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      createRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      updateRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      deleteRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
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
          name: 'arquivo',
          type: 'file',
          maxSelect: 1,
          maxSize: 524288000,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'tamanho_bytes', type: 'number' },
        { name: 'data_medicao', type: 'date', required: true },
        { name: 'massa_magra', type: 'number' },
        { name: 'percentual_gordura', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_bio_usuario_data ON bioimpedancia_pdf (usuario_id, data_medicao)',
      ],
    })
    app.save(bioimpedanciaCollection)

    const injetaveisCollection = new Collection({
      name: 'injetaveis',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.email = 'admin@canever.com.br'",
      updateRule: "@request.auth.email = 'admin@canever.com.br'",
      deleteRule: "@request.auth.email = 'admin@canever.com.br'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: true },
        { name: 'funcionalidades', type: 'text' },
        { name: 'preco_ampola', type: 'number' },
        { name: 'preco_kit', type: 'number' },
        { name: 'quantidade_kit', type: 'number' },
        {
          name: 'imagem',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(injetaveisCollection)

    const pedidosCollection = new Collection({
      name: 'pedidos_injetaveis',
      type: 'base',
      listRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      viewRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      createRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      updateRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      deleteRule: "usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
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
          name: 'injetavel_id',
          type: 'relation',
          required: true,
          collectionId: injetaveisCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'tipo_compra', type: 'select', values: ['ampola', 'kit'], maxSelect: 1 },
        { name: 'quantidade', type: 'number', required: true },
        { name: 'preco_total', type: 'number', required: true },
        {
          name: 'opcao_entrega',
          type: 'select',
          values: ['agendar_clinica', 'enviar_endereco'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['pendente_pagamento', 'pago', 'agendado', 'enviado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'data_agendamento', type: 'date' },
        { name: 'endereco_entrega', type: 'text' },
        { name: 'stripe_payment_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pedidos_usuario_status ON pedidos_injetaveis (usuario_id, status)',
      ],
    })
    app.save(pedidosCollection)
  },
  (app) => {
    const collections = [
      'pedidos_injetaveis',
      'injetaveis',
      'bioimpedancia_pdf',
      'exames_pdf',
      'fotos_paciente',
    ]
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
