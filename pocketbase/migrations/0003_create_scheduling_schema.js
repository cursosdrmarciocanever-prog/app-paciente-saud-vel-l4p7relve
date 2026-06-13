migrate(
  (app) => {
    // Collection: slots_disponiveis
    const slots = new Collection({
      name: 'slots_disponiveis',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'data', type: 'date', required: true },
        { name: 'hora_inicio', type: 'text', required: true },
        { name: 'hora_fim', type: 'text', required: true },
        {
          name: 'medico_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'agendado', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_slots_data_agendado ON slots_disponiveis (data, agendado)'],
    })
    app.save(slots)

    // Collection: agendamentos
    const agendamentos = new Collection({
      name: 'agendamentos',
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
          maxSelect: 1,
        },
        { name: 'slot_id', type: 'relation', required: true, collectionId: slots.id, maxSelect: 1 },
        { name: 'data_agendamento', type: 'date', required: true },
        { name: 'hora_agendamento', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['confirmado', 'cancelado', 'realizado'],
          maxSelect: 1,
        },
        {
          name: 'tipo_consulta',
          type: 'select',
          required: true,
          values: ['presencial', 'telemedicina'],
          maxSelect: 1,
        },
        { name: 'notas', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_agendamentos_usuario_status ON agendamentos (usuario_id, status)',
      ],
    })
    app.save(agendamentos)

    // Collection: historico_elegibilidade
    const historico = new Collection({
      name: 'historico_elegibilidade',
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
          maxSelect: 1,
        },
        { name: 'ultima_consulta', type: 'date' },
        { name: 'proxima_consulta_permitida', type: 'date' },
        { name: 'consultas_realizadas_ano', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_historico_usuario ON historico_elegibilidade (usuario_id)'],
    })
    app.save(historico)
  },
  (app) => {
    try {
      const historico = app.findCollectionByNameOrId('historico_elegibilidade')
      app.delete(historico)
    } catch (_) {}

    try {
      const agendamentos = app.findCollectionByNameOrId('agendamentos')
      app.delete(agendamentos)
    } catch (_) {}

    try {
      const slots = app.findCollectionByNameOrId('slots_disponiveis')
      app.delete(slots)
    } catch (_) {}
  },
)
