/// <reference path="../pb_data/types.d.ts" />

// Login por telefone (WhatsApp): adiciona `telefone` aos campos de identidade do
// auth-with-password (mantém `email` p/ contas antigas) + índice único parcial
// no telefone (exigido p/ ser identidade; ignora telefones vazios de registros
// antigos).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    try {
      col.addIndex('idx_users_telefone_unique', true, 'telefone', "telefone != ''")
    } catch (e) {
      /* já existe */
    }
    col.passwordAuth.identityFields = ['email', 'telefone']
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    try {
      col.removeIndex('idx_users_telefone_unique')
    } catch (e) {
      /* ignora */
    }
    col.passwordAuth.identityFields = ['email']
    app.save(col)
  },
)
