/// <reference path="../pb_data/types.d.ts" />

// Habilita anexar EXAMES por CPF: adiciona campo cpf + índice e torna usuario_id
// opcional (para exames "pendentes" enquanto o paciente não se cadastra).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('exames_pdf')
    if (!col.fields.getByName('cpf')) {
      col.fields.add(new TextField({ name: 'cpf', required: false, max: 14 }))
    }
    const uid = col.fields.getByName('usuario_id')
    if (uid) uid.required = false
    app.save(col)
    try {
      col.addIndex('idx_exames_cpf', false, 'cpf', '')
      app.save(col)
    } catch (e) {
      /* índice já existe */
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('exames_pdf')
    try {
      col.removeIndex('idx_exames_cpf')
    } catch (e) {
      /* ignora */
    }
    const f = col.fields.getByName('cpf')
    if (f) col.fields.removeById(f.id)
    const uid = col.fields.getByName('usuario_id')
    if (uid) uid.required = true
    app.save(col)
  },
)
