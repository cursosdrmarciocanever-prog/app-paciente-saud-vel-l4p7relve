/// <reference path="../pb_data/types.d.ts" />

// Cadastro de paciente: exige nome completo, CPF, e-mail e telefone (WhatsApp).
// Validação no momento da CRIAÇÃO do usuário (não afeta registros existentes).
onRecordCreate((e) => {
  const nome = (e.record.getString('name') || '').trim()
  const email = (e.record.getString('email') || '').trim()
  const cpf = (e.record.getString('cpf') || '').replace(/\D/g, '')
  const telefone = (e.record.getString('telefone') || '').replace(/\D/g, '')

  if (!nome || nome.split(/\s+/).length < 2) {
    throw new BadRequestError('Informe o nome completo (nome e sobrenome).')
  }
  if (!email) {
    throw new BadRequestError('Informe o e-mail.')
  }
  if (cpf.length !== 11) {
    throw new BadRequestError('Informe um CPF válido (11 dígitos).')
  }
  if (telefone.length < 10) {
    throw new BadRequestError('Informe um telefone (WhatsApp) válido com DDD.')
  }

  // normaliza
  e.record.set('cpf', cpf)
  e.record.set('telefone', telefone)

  e.next()
}, 'users')
