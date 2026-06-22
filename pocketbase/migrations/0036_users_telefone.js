/// <reference path="../pb_data/types.d.ts" />

// Adiciona o campo telefone (WhatsApp) ao cadastro de usuários.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('telefone')) {
      users.fields.add(new TextField({ name: 'telefone', required: false, max: 20 }))
      app.save(users)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const f = users.fields.getByName('telefone')
    if (f) {
      users.fields.removeById(f.id)
      app.save(users)
    }
  },
)
