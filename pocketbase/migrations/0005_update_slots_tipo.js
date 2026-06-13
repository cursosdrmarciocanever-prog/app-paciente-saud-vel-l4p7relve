migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('slots_disponiveis')

    col.createRule = "@request.auth.id != '' && medico_id = @request.auth.id"
    col.updateRule = "@request.auth.id != '' && medico_id = @request.auth.id"
    col.deleteRule = "@request.auth.id != '' && medico_id = @request.auth.id"

    if (!col.fields.getByName('tipo')) {
      col.fields.add(
        new SelectField({
          name: 'tipo',
          values: ['presencial', 'telemedicina'],
          maxSelect: 1,
          required: false,
        }),
      )
    }

    app.save(col)

    app
      .db()
      .newQuery("UPDATE slots_disponiveis SET tipo = 'presencial' WHERE tipo IS NULL OR tipo = ''")
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('slots_disponiveis')
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    if (col.fields.getByName('tipo')) {
      col.fields.removeByName('tipo')
    }
    app.save(col)
  },
)
