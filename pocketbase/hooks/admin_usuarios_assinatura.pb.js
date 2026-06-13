routerAdd(
  'PATCH',
  '/backend/v1/admin/assinaturas/{id}',
  (e) => {
    const auth = e.auth
    if (!auth) return e.forbiddenError('Acesso negado')
    const email = auth.email()
    if (email !== 'admin@canever.com.br' && email !== 'marciocanever@hotmail.com') {
      return e.forbiddenError('Acesso negado')
    }

    const id = e.request.pathValue('id')
    const body = e.requestInfo().body
    const newStatus = body.status

    if (!newStatus) return e.badRequestError('Status é obrigatório')

    try {
      const record = $app.findRecordById('assinaturas', id)
      record.set('status', newStatus)
      $app.save(record)
      return e.json(200, { success: true })
    } catch (err) {
      return e.internalServerError('Erro ao atualizar')
    }
  },
  $apis.requireAuth(),
)
