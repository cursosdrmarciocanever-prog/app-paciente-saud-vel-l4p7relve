/// <reference path="../pb_data/types.d.ts" />

// As "fotos" da clínica chegam como PDF (foto convertida). Libera PDF (além de
// imagens) no campo foto e aumenta o tamanho máximo.
migrate(
  (app) => {
    const fotos = app.findCollectionByNameOrId('fotos_paciente')
    const f = fotos.fields.getByName('foto')
    if (f) {
      f.mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      f.maxSize = 52428800 // 50MB
      app.save(fotos)
    }
  },
  (app) => {
    try {
      const fotos = app.findCollectionByNameOrId('fotos_paciente')
      const f = fotos.fields.getByName('foto')
      if (f) {
        f.mimeTypes = ['image/jpeg', 'image/png', 'image/webp']
        f.maxSize = 5242880
        app.save(fotos)
      }
    } catch (_) {}
  },
)
