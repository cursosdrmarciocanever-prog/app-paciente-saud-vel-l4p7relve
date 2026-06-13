routerAdd(
  'GET',
  '/backend/v1/admin/verify',
  (e) => {
    if (!e.auth) {
      throw new UnauthorizedError('Faça login para continuar')
    }

    if (e.auth.getString('email') !== 'admin@canever.com.br') {
      throw new ForbiddenError('Você não tem permissão para acessar esta página')
    }

    return e.json(200, { verified: true })
  },
  $apis.requireAuth(),
)
