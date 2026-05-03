migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')

    col.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    col.viewRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    col.createRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    col.updateRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    col.deleteRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"

    col.fields.add(
      new SelectField({
        name: 'type',
        maxSelect: 1,
        values: ['email', 'sms', 'whatsapp'],
      }),
    )
    col.fields.add(
      new TextField({
        name: 'subject',
      }),
    )
    col.fields.add(
      new SelectField({
        name: 'status',
        maxSelect: 1,
        values: ['enviado', 'pendente', 'falha'],
      }),
    )
    col.fields.add(
      new DateField({
        name: 'sent_at',
      }),
    )

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')

    col.listRule = "@request.auth.id != '' && user = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    col.createRule = null
    col.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    col.deleteRule = "@request.auth.id != '' && user = @request.auth.id"

    col.fields.removeByName('type')
    col.fields.removeByName('subject')
    col.fields.removeByName('status')
    col.fields.removeByName('sent_at')

    app.save(col)
  },
)
