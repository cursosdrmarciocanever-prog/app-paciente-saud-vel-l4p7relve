routerAdd(
  'DELETE',
  '/backend/v1/admin/usuarios/{id}',
  (e) => {
    const auth = e.auth
    if (!auth) return e.forbiddenError('Acesso negado')
    const email = auth.email()
    if (email !== 'admin@canever.com.br' && email !== 'marciocanever@hotmail.com') {
      return e.forbiddenError('Acesso negado')
    }

    const id = e.request.pathValue('id')

    $app.runInTransaction((txApp) => {
      // Cascade delete related records manually
      const assinaturas = txApp.findRecordsByFilter(
        'assinaturas',
        `usuario_id = '${id}'`,
        '',
        100,
        0,
      )
      for (const a of assinaturas) txApp.delete(a)

      const historicos = txApp.findRecordsByFilter(
        'historico_elegibilidade',
        `usuario_id = '${id}'`,
        '',
        100,
        0,
      )
      for (const h of historicos) txApp.delete(h)

      const agendamentos = txApp.findRecordsByFilter(
        'agendamentos',
        `usuario_id = '${id}'`,
        '',
        100,
        0,
      )
      for (const ag of agendamentos) txApp.delete(ag)

      try {
        const user = txApp.findRecordById('users', id)
        txApp.delete(user)
      } catch (_) {}
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
