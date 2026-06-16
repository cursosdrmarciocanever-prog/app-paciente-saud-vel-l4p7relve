/// <reference path="../pb_data/types.d.ts" />

// Adiciona métricas de composição corporal à bioimpedância, para calcular a
// evolução (peso, massa muscular esquelética, massa de gordura). O campo
// percentual_gordura já existe. massa_magra (legado) é mantido.
migrate(
  (app) => {
    const bio = app.findCollectionByNameOrId('bioimpedancia_pdf')
    const addNum = (name) => {
      if (!bio.fields.getByName(name)) {
        bio.fields.add(new NumberField({ name, required: false }))
      }
    }
    addNum('peso')
    addNum('massa_muscular')
    addNum('massa_gordura')
    app.save(bio)
  },
  (app) => {
    try {
      const bio = app.findCollectionByNameOrId('bioimpedancia_pdf')
      for (const name of ['peso', 'massa_muscular', 'massa_gordura']) {
        bio.fields.removeByName(name)
      }
      app.save(bio)
    } catch (_) {}
  },
)
