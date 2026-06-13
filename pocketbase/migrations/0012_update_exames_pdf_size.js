migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('exames_pdf')
    const field = col.fields.getByName('arquivo')
    if (field) {
      field.maxSize = 524288000 // 500MB
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('exames_pdf')
    const field = col.fields.getByName('arquivo')
    if (field) {
      field.maxSize = 5242880 // 5MB (default)
      app.save(col)
    }
  },
)
