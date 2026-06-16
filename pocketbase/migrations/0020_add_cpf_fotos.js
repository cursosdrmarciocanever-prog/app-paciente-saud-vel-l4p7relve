/// <reference path="../pb_data/types.d.ts" />

// Mesmo esquema da bioimpedância, agora para as fotos: CPF na foto e usuario_id
// opcional (permite foto "pendente" só com CPF, vinculada quando o paciente se
// cadastrar com aquele CPF — ver hook bioimpedancia_cpf_link).
migrate(
  (app) => {
    const fotos = app.findCollectionByNameOrId('fotos_paciente')
    if (!fotos.fields.getByName('cpf')) {
      fotos.fields.add(new TextField({ name: 'cpf', required: false, max: 14 }))
    }
    const usuarioField = fotos.fields.getByName('usuario_id')
    if (usuarioField) usuarioField.required = false
    fotos.addIndex('idx_fotos_cpf', false, 'cpf', '')
    app.save(fotos)
  },
  (app) => {
    try {
      const fotos = app.findCollectionByNameOrId('fotos_paciente')
      fotos.removeIndex('idx_fotos_cpf')
      fotos.fields.removeByName('cpf')
      const usuarioField = fotos.fields.getByName('usuario_id')
      if (usuarioField) usuarioField.required = true
      app.save(fotos)
    } catch (_) {}
  },
)
