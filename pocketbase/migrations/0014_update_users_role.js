migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'financeiro', 'paciente'],
          required: false,
        }),
      )
    }

    users.listRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'financeiro'"
    users.viewRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'financeiro'"
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"

    app.save(users)

    app
      .db()
      .newQuery("UPDATE users SET role = 'paciente' WHERE role IS NULL OR role = ''")
      .execute()
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')

    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'

    app.save(users)
  },
)
