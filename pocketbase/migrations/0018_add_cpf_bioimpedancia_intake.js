/// <reference path="../pb_data/types.d.ts" />

// Adiciona CPF aos pacientes e à bioimpedância, e torna o usuario_id da
// bioimpedância OPCIONAL — permitindo anexar um exame por CPF antes do paciente
// ter conta (fica "pendente" e é vinculado depois pelo hook bioimpedancia_cpf_link).
migrate(
  (app) => {
    // 1. CPF nos usuários (pacientes)
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('cpf')) {
      users.fields.add(
        new TextField({
          name: 'cpf',
          required: false,
          max: 14, // aceita com ou sem máscara; normalizamos para dígitos no app/hook
        }),
      )
    }
    // índice para busca por CPF (não único: CPF vazio é permitido em várias contas)
    users.addIndex('idx_users_cpf', false, 'cpf', '')
    app.save(users)

    // 2. CPF na bioimpedância + usuario_id opcional
    const bio = app.findCollectionByNameOrId('bioimpedancia_pdf')
    if (!bio.fields.getByName('cpf')) {
      bio.fields.add(new TextField({ name: 'cpf', required: false, max: 14 }))
    }
    const usuarioField = bio.fields.getByName('usuario_id')
    if (usuarioField) {
      usuarioField.required = false // permite bioimpedância pendente (sem paciente ainda)
    }
    bio.addIndex('idx_bio_cpf', false, 'cpf', '')
    app.save(bio)
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.removeIndex('idx_users_cpf')
      users.fields.removeByName('cpf')
      app.save(users)
    } catch (_) {}
    try {
      const bio = app.findCollectionByNameOrId('bioimpedancia_pdf')
      bio.removeIndex('idx_bio_cpf')
      bio.fields.removeByName('cpf')
      const usuarioField = bio.fields.getByName('usuario_id')
      if (usuarioField) usuarioField.required = true
      app.save(bio)
    } catch (_) {}
  },
)
