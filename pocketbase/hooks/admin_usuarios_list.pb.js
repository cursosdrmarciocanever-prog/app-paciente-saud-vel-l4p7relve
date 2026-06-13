routerAdd(
  'GET',
  '/backend/v1/admin/usuarios',
  (e) => {
    const auth = e.auth
    if (!auth) {
      return e.forbiddenError('Acesso negado')
    }
    const email = auth.email()
    if (email !== 'admin@canever.com.br' && email !== 'marciocanever@hotmail.com') {
      return e.forbiddenError('Acesso negado')
    }

    const users = $app.findRecordsByFilter('users', '1=1', '-created', 1000, 0)
    const assinaturas = $app.findRecordsByFilter('assinaturas', '1=1', '', 1000, 0)
    const historicos = $app.findRecordsByFilter('historico_elegibilidade', '1=1', '', 1000, 0)

    const assMap = {}
    for (const a of assinaturas) {
      assMap[a.getString('usuario_id')] = a
    }

    const histMap = {}
    for (const h of historicos) {
      histMap[h.getString('usuario_id')] = h
    }

    const result = []
    for (const u of users) {
      const a = assMap[u.id]
      const h = histMap[u.id]
      result.push({
        id: u.id,
        name: u.getString('name'),
        email: u.email(),
        cpf: u.getString('cpf'),
        created: u.getString('created'),
        plano: a ? a.getString('plano') : 'Nenhum',
        status: a ? a.getString('status') : 'Inativo',
        assinatura_id: a ? a.id : '',
        ultima_consulta: h ? h.getString('ultima_consulta') : '',
      })
    }

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
