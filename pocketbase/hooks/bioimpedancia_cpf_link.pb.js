/// <reference path="../pb_data/types.d.ts" />

// GATILHO de vínculo de bioimpedância por CPF (toda lógica INLINE — exigência do JSVM).
//
// 1) Ao criar uma bioimpedância: normaliza o CPF (só dígitos) e, se não houver
//    paciente vinculado, procura um usuário com aquele CPF e vincula. Se ainda não
//    existir paciente, o registro fica "pendente" (usuario_id vazio).
// 2) Ao cadastrar/atualizar um paciente com CPF: vincula automaticamente todas as
//    bioimpedâncias pendentes daquele CPF (modo gratuito — sem exigir assinatura).

// (1) Normaliza + vincula na criação da bioimpedância
onRecordCreate((e) => {
  const cpf = (e.record.getString('cpf') || '').replace(/\D/g, '')
  if (cpf) e.record.set('cpf', cpf)

  if (cpf && !e.record.getString('usuario_id')) {
    try {
      const paciente = $app.findFirstRecordByFilter('users', 'cpf = {:cpf}', { cpf })
      e.record.set('usuario_id', paciente.id)
    } catch (_) {
      // nenhum paciente com esse CPF ainda -> fica pendente
    }
  }
  e.next()
}, 'bioimpedancia_pdf')

// (1b) Mesmo gatilho para as FOTOS do paciente
onRecordCreate((e) => {
  const cpf = (e.record.getString('cpf') || '').replace(/\D/g, '')
  if (cpf) e.record.set('cpf', cpf)

  if (cpf && !e.record.getString('usuario_id')) {
    try {
      const paciente = $app.findFirstRecordByFilter('users', 'cpf = {:cpf}', { cpf })
      e.record.set('usuario_id', paciente.id)
    } catch (_) {
      // nenhum paciente com esse CPF ainda -> fica pendente
    }
  }
  e.next()
}, 'fotos_paciente')

// Normaliza o CPF do usuário antes de salvar (criação e atualização)
onRecordCreate((e) => {
  const cpf = (e.record.getString('cpf') || '').replace(/\D/g, '')
  if (cpf !== e.record.getString('cpf')) e.record.set('cpf', cpf)
  e.next()
}, 'users')

onRecordUpdate((e) => {
  const cpf = (e.record.getString('cpf') || '').replace(/\D/g, '')
  if (cpf !== e.record.getString('cpf')) e.record.set('cpf', cpf)
  e.next()
}, 'users')

// (2) Vincula bioimpedâncias pendentes quando o paciente passa a ter CPF
const vincularPendentes = (e) => {
  try {
    const cpf = (e.record.getString('cpf') || '').replace(/\D/g, '')
    if (cpf) {
      // Vincula registros pendentes (sem usuario_id) das duas coleções por CPF
      for (const colecao of ['bioimpedancia_pdf', 'fotos_paciente']) {
        const pendentes = $app.findRecordsByFilter(
          colecao,
          "cpf = {:cpf} && usuario_id = ''",
          '',
          500,
          0,
          { cpf },
        )
        for (const rec of pendentes) {
          rec.set('usuario_id', e.record.id)
          $app.save(rec)
        }
        if (pendentes.length > 0) {
          $app.logger().info('Registros vinculados por CPF', 'colecao', colecao, 'cpf', cpf, 'qtd', pendentes.length)
        }
      }
    }
  } catch (err) {
    $app.logger().error('Erro ao vincular registros pendentes', 'error', String(err))
  }
  e.next()
}

onRecordAfterCreateSuccess(vincularPendentes, 'users')
onRecordAfterUpdateSuccess(vincularPendentes, 'users')
