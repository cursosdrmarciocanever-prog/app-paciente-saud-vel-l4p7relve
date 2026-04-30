migrate(
  (app) => {
    const bioCol = app.findCollectionByNameOrId('bioimpedance')
    const reportField = bioCol.fields.getByName('report')
    if (reportField) {
      reportField.maxSize = 20971520
      app.save(bioCol)
    }

    const photoCol = app.findCollectionByNameOrId('evolution_photos')
    const photoField = photoCol.fields.getByName('photo')
    if (photoField) {
      photoField.maxSize = 20971520
      app.save(photoCol)
    }
  },
  (app) => {
    const bioCol = app.findCollectionByNameOrId('bioimpedance')
    const reportField = bioCol.fields.getByName('report')
    if (reportField) {
      reportField.maxSize = 5242880
      app.save(bioCol)
    }

    const photoCol = app.findCollectionByNameOrId('evolution_photos')
    const photoField = photoCol.fields.getByName('photo')
    if (photoField) {
      photoField.maxSize = 5242880
      app.save(photoCol)
    }
  },
)
