/// <reference path="../pb_data/types.d.ts" />

// Endpoint admin para atualizar dados do paciente (CPF, telefone, nome).
// Necessário porque a updateRule de `users` é "id = @request.auth.id" (só o
// próprio usuário) — o admin não consegue editar outro usuário direto.
routerAdd(
  'PATCH',
  '/backend/v1/admin/usuarios/{id}',
  (e) => {
    const auth = e.auth
    if (!auth) return e.forbiddenError('Acesso negado')
    const email = auth.email()
    if (email !== 'admin@canever.com.br' && email !== 'marciocanever@hotmail.com') {
      return e.forbiddenError('Acesso negado')
    }

    const userId = e.request.pathValue('id')
    let user
    try {
      user = $app.findRecordById('users', userId)
    } catch (_) {
      return e.notFoundError('Usuário não encontrado')
    }

    const body = e.requestInfo().body || {}
    if (body.cpf !== undefined) user.set('cpf', String(body.cpf).replace(/\D/g, ''))
    if (body.telefone !== undefined) user.set('telefone', String(body.telefone).replace(/\D/g, ''))
    if (body.name !== undefined && String(body.name).trim()) user.set('name', String(body.name).trim())

    try {
      $app.save(user)
    } catch (err) {
      return e.badRequestError(String(err))
    }

    return e.json(200, {
      success: true,
      cpf: user.getString('cpf'),
      telefone: user.getString('telefone'),
    })
  },
  $apis.requireAuth(),
)
