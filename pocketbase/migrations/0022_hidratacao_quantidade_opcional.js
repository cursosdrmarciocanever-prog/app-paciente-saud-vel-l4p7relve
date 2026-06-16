/// <reference path="../pb_data/types.d.ts" />

// O PocketBase trata 0 como "vazio" em campo number obrigatório. Como o registro
// de hidratação pode existir com 0 ml (ex.: paciente ajusta só a meta antes de
// beber), tornamos quantidade_ml NÃO obrigatório para aceitar 0.
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('hidratacao')
    const f = col.fields.getByName('quantidade_ml')
    if (f) {
      f.required = false
      app.save(col)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('hidratacao')
      const f = col.fields.getByName('quantidade_ml')
      if (f) {
        f.required = true
        app.save(col)
      }
    } catch (_) {}
  },
)
