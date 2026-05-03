migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    // Seed admin
    try {
      app.findAuthRecordByEmail('users', 'admin@canever.com.br')
    } catch (_) {
      const adminRecord = new Record(usersCol)
      adminRecord.setEmail('admin@canever.com.br')
      adminRecord.setPassword('senha123')
      adminRecord.setVerified(true)
      adminRecord.set('name', 'Admin')
      adminRecord.set('role', 'admin')
      app.save(adminRecord)
    }

    // Seed financeiro
    try {
      app.findAuthRecordByEmail('users', 'financeiro@canever.com.br')
    } catch (_) {
      const finRecord = new Record(usersCol)
      finRecord.setEmail('financeiro@canever.com.br')
      finRecord.setPassword('senha123')
      finRecord.setVerified(true)
      finRecord.set('name', 'Financeiro')
      finRecord.set('role', 'financeiro')
      app.save(finRecord)
    }

    // Update Users API Rules
    usersCol.listRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'financeiro'"
    usersCol.viewRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'financeiro'"
    usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(usersCol)

    // Update Subscriptions API Rules
    const subsCol = app.findCollectionByNameOrId('subscriptions')
    subsCol.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    subsCol.viewRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    subsCol.createRule = "@request.auth.id != ''"
    subsCol.updateRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    subsCol.deleteRule = "@request.auth.role = 'admin'"
    app.save(subsCol)

    // Update Appointments API Rules
    const apptsCol = app.findCollectionByNameOrId('appointments')
    apptsCol.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    apptsCol.viewRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    apptsCol.createRule = "@request.auth.id != ''"
    apptsCol.updateRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.role = 'admin')"
    apptsCol.deleteRule = "@request.auth.role = 'admin'"
    app.save(apptsCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    try {
      const admin = app.findAuthRecordByEmail('users', 'admin@canever.com.br')
      app.delete(admin)
    } catch (_) {}
    try {
      const financeiro = app.findAuthRecordByEmail('users', 'financeiro@canever.com.br')
      app.delete(financeiro)
    } catch (_) {}
  },
)
