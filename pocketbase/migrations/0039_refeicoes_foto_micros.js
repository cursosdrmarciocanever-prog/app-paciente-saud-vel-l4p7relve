/// <reference path="../pb_data/types.d.ts" />

// Adiciona à coleção refeicoes:
//  - foto: a imagem do prato analisado (PROTEGIDA — padrão LGPD, exige token)
//  - micros: micronutrientes estimados pela IA (JSON: [{nome, quantidade, unidade}])
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('refeicoes')
    if (!col.fields.getByName('foto')) {
      col.fields.add(
        new FileField({
          name: 'foto',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          protected: true,
        }),
      )
    }
    if (!col.fields.getByName('micros')) {
      col.fields.add(new JSONField({ name: 'micros', required: false, maxSize: 20000 }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('refeicoes')
    for (const name of ['foto', 'micros']) {
      const f = col.fields.getByName(name)
      if (f) col.fields.removeById(f.id)
    }
    app.save(col)
  },
)
