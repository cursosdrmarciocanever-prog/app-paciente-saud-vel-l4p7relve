/// <reference path="../pb_data/types.d.ts" />

// Adiciona macronutrientes (proteínas, carboidratos, gorduras em gramas) à
// coleção refeicoes, para registrar a estimativa nutricional — inclusive a
// gerada pela análise de foto do prato (assistente nutricional por imagem).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('refeicoes')
    const add = (name) => {
      if (!col.fields.getByName(name)) {
        col.fields.add(new NumberField({ name: name, required: false, min: 0 }))
      }
    }
    add('proteinas')
    add('carboidratos')
    add('gorduras')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('refeicoes')
    for (const name of ['proteinas', 'carboidratos', 'gorduras']) {
      const f = col.fields.getByName(name)
      if (f) col.fields.removeById(f.id)
    }
    app.save(col)
  },
)
