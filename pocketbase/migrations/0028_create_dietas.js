/// <reference path="../pb_data/types.d.ts" />

// Coleção de dietas/planos alimentares por paciente.
// - Paciente (qualquer plano) vê as próprias dietas.
// - Premium pode criar a própria (salvando do Assistente Nutricional).
// - Admin (admin@canever.com.br ou marciocanever@hotmail.com) cria/gerencia para qualquer paciente.
migrate(
  (app) => {
    const ADMIN =
      "@request.auth.email = 'admin@canever.com.br' || @request.auth.email = 'marciocanever@hotmail.com'"
    const dono = `usuario_id = @request.auth.id || ${ADMIN}`

    const dietas = new Collection({
      name: 'dietas',
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
        { name: 'titulo', type: 'text', required: true, max: 200 },
        { name: 'conteudo', type: 'text', required: true },
        {
          name: 'origem',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['assistente', 'admin'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_dietas_usuario_created ON dietas (usuario_id, created)'],
    })
    app.save(dietas)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('dietas')
    app.delete(col)
  },
)
