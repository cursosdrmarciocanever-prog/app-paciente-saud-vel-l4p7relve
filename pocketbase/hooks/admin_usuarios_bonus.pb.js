routerAdd(
  'POST',
  '/backend/v1/admin/usuarios/{id}/assinatura-bonus',
  (e) => {
    const auth = e.auth
    if (!auth) return e.forbiddenError('Acesso negado')
    const email = auth.email()
    if (email !== 'admin@canever.com.br' && email !== 'marciocanever@hotmail.com') {
      return e.forbiddenError('Acesso negado')
    }

    const userId = e.request.pathValue('id')

    try {
      $app.findRecordById('users', userId)
    } catch (_) {
      return e.notFoundError('Usuário não encontrado')
    }

    let record
    try {
      const records = $app.findRecordsByFilter(
        'assinaturas',
        `usuario_id = "${userId}"`,
        '-created',
        1,
        0,
      )
      if (records.length > 0) {
        record = records[0]
      }
    } catch (_) {}

    if (!record) {
      const collection = $app.findCollectionByNameOrId('assinaturas')
      record = new Record(collection)
      record.set('usuario_id', userId)
    }

    const now = new Date()
    const nextYear = new Date(now)
    nextYear.setFullYear(now.getFullYear() + 1)

    record.set('status', 'ativo')
    record.set('plano', 'Bônus/Cortesia')
    record.set('data_inicio', now.toISOString())
    record.set('data_renovacao', nextYear.toISOString())
    record.set('stripe_subscription_id', '')

    $app.save(record)

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
