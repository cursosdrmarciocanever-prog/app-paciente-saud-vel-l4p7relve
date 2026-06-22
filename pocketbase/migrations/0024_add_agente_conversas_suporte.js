/// <reference path="../pb_data/types.d.ts" />

// Adiciona o campo "agente" às conversas de suporte, para rotear cada conversa
// ao assistente de IA correto (geral / exames / nutricional / medico).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('conversas_suporte')
    col.fields.add(
      new SelectField({
        name: 'agente',
        required: false,
        maxSelect: 1,
        values: ['geral', 'exames', 'nutricional', 'medico'],
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('conversas_suporte')
    const field = col.fields.getByName('agente')
    if (field) {
      col.fields.removeById(field.id)
      app.save(col)
    }
  },
)
