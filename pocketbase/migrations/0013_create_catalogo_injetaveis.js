migrate(
  (app) => {
    const collection = new Collection({
      name: 'catalogo_injetaveis',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.email = 'admin@canever.com.br'",
      updateRule: "@request.auth.email = 'admin@canever.com.br'",
      deleteRule: "@request.auth.email = 'admin@canever.com.br'",
      fields: [
        { name: 'produto', type: 'text', required: true },
        { name: 'tipo', type: 'text', required: false },
        { name: 'funcao', type: 'text', required: false },
        { name: 'via_administracao', type: 'text', required: false },
        { name: 'ponsologia_recomendada', type: 'text', required: false },
        { name: 'valor', type: 'number', required: false },
        { name: 'ativo', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('catalogo_injetaveis')
    app.delete(collection)
  },
)
