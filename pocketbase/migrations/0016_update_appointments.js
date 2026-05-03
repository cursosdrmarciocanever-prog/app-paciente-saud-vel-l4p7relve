migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('appointments')

    if (!col.fields.getByName('subscription')) {
      col.fields.add(
        new RelationField({
          name: 'subscription',
          collectionId: app.findCollectionByNameOrId('subscriptions').id,
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('type')) {
      col.fields.add(
        new SelectField({ name: 'type', values: ['presencial', 'telemedicina'], maxSelect: 1 }),
      )
    }

    const statusField = col.fields.getByName('status')
    if (statusField) {
      statusField.values = ['agendado', 'concluido', 'cancelado']
    }

    col.listRule =
      "@request.auth.role = 'admin' || (@request.auth.id != '' && user = @request.auth.id)"
    col.viewRule =
      "@request.auth.role = 'admin' || (@request.auth.id != '' && user = @request.auth.id)"
    col.createRule =
      "@request.auth.role = 'admin' || (@request.auth.id != '' && user = @request.auth.id)"
    col.updateRule =
      "@request.auth.role = 'admin' || (@request.auth.id != '' && user = @request.auth.id)"
    col.deleteRule = "@request.auth.role = 'admin'"

    app.save(col)

    // Set default values for old records
    app
      .db()
      .newQuery("UPDATE appointments SET type = 'presencial' WHERE type IS NULL OR type = ''")
      .execute()
    app
      .db()
      .newQuery("UPDATE appointments SET status = 'agendado' WHERE status = 'Pendente'")
      .execute()
    app
      .db()
      .newQuery("UPDATE appointments SET status = 'concluido' WHERE status = 'Confirmado'")
      .execute()
    app
      .db()
      .newQuery("UPDATE appointments SET status = 'cancelado' WHERE status = 'Cancelado'")
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('appointments')
    col.fields.removeByName('subscription')
    col.fields.removeByName('type')

    const statusField = col.fields.getByName('status')
    if (statusField) {
      statusField.values = ['Pendente', 'Confirmado', 'Cancelado']
    }

    col.listRule = "@request.auth.id != '' && user = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    col.createRule = "@request.auth.id != '' && user = @request.auth.id"
    col.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    col.deleteRule = "@request.auth.id != '' && user = @request.auth.id"

    app.save(col)
  },
)
