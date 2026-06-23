/// <reference path="../pb_data/types.d.ts" />

// Permite anexar a dieta como ARQUIVO (PDF/imagem) — ex.: o plano que a
// nutricionista montou no Word/Canva, preservando o layout. O arquivo é
// PROTEGIDO (padrão LGPD, exige token). `conteudo` (texto) vira opcional, pois
// uma dieta pode ser só o PDF, só texto, ou os dois.
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('dietas')
    if (!col.fields.getByName('arquivo')) {
      col.fields.add(
        new FileField({
          name: 'arquivo',
          required: false,
          maxSelect: 1,
          maxSize: 52428800, // 50MB
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          protected: true,
        }),
      )
    }
    const cont = col.fields.getByName('conteudo')
    if (cont) cont.required = false
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('dietas')
    const f = col.fields.getByName('arquivo')
    if (f) col.fields.removeById(f.id)
    const cont = col.fields.getByName('conteudo')
    if (cont) cont.required = true
    app.save(col)
  },
)
