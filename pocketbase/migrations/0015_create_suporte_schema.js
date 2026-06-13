migrate(
  (app) => {
    const conversas = new Collection({
      name: 'conversas_suporte',
      type: 'base',
      listRule: "@request.auth.id = usuario_id || @request.auth.email = 'admin@canever.com.br'",
      viewRule: "@request.auth.id = usuario_id || @request.auth.email = 'admin@canever.com.br'",
      createRule: "@request.auth.id != '' && @request.body.usuario_id = @request.auth.id",
      updateRule: "@request.auth.id = usuario_id || @request.auth.email = 'admin@canever.com.br'",
      deleteRule: null,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativa', 'encerrada'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_conversas_suporte_usuario_status ON conversas_suporte (usuario_id, status)',
      ],
    })
    app.save(conversas)

    const mensagens = new Collection({
      name: 'mensagens_suporte',
      type: 'base',
      listRule:
        "conversa_id.usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      viewRule:
        "conversa_id.usuario_id = @request.auth.id || @request.auth.email = 'admin@canever.com.br'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'conversa_id',
          type: 'relation',
          required: true,
          collectionId: conversas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'remetente',
          type: 'select',
          required: true,
          values: ['paciente', 'agente_ia'],
          maxSelect: 1,
        },
        { name: 'conteudo', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_mensagens_suporte_conversa_created ON mensagens_suporte (conversa_id, created)',
      ],
    })
    app.save(mensagens)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('mensagens_suporte'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('conversas_suporte'))
    } catch (_) {}
  },
)
