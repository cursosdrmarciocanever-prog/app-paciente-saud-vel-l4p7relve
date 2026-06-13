/// <reference path="../pb_data/types.d.ts" />

// Endpoint para automação (n8n / WhatsApp): anexa uma bioimpedância por CPF.
//
// POST /backend/v1/bioimpedancia/anexar
// Header:  X-Intake-Token: <valor do secret BIOIMPEDANCIA_INTAKE_TOKEN>
// Body JSON: {
//   "cpf": "12345678900",                       // obrigatório (com ou sem máscara)
//   "data_medicao": "2026-06-10",               // obrigatório
//   "arquivo_url": "https://.../exame.pdf",      // obrigatório (URL do PDF)
//   "nome_arquivo": "bioimpedancia.pdf"          // opcional
// }
//
// O hook bioimpedancia_cpf_link vincula automaticamente ao paciente com esse CPF
// (ou deixa pendente até ele se cadastrar). Não exige assinatura (modo gratuito).
routerAdd('POST', '/backend/v1/bioimpedancia/anexar', (e) => {
  const expected = $os.getenv('BIOIMPEDANCIA_INTAKE_TOKEN')
  if (!expected) {
    return e.json(503, { error: 'Integração não configurada (defina BIOIMPEDANCIA_INTAKE_TOKEN).' })
  }
  const info = e.requestInfo()
  const token = (info.headers && info.headers['x_intake_token']) || ''
  if (token !== expected) {
    return e.json(401, { error: 'Token inválido.' })
  }

  const body = info.body || {}
  const cpf = String(body.cpf || '').replace(/\D/g, '')
  const dataMedicao = String(body.data_medicao || '')
  const arquivoUrl = String(body.arquivo_url || '')

  if (cpf.length !== 11) return e.json(400, { error: 'CPF inválido (11 dígitos).' })
  if (!dataMedicao) return e.json(400, { error: 'data_medicao é obrigatória.' })
  if (!arquivoUrl) return e.json(400, { error: 'arquivo_url é obrigatória.' })

  try {
    const col = $app.findCollectionByNameOrId('bioimpedancia_pdf')
    const record = new Record(col)
    record.set('cpf', cpf)
    record.set('data_medicao', dataMedicao)

    const file = $filesystem.fileFromURL(arquivoUrl)
    if (body.nome_arquivo) file.originalName = String(body.nome_arquivo)
    record.set('arquivo', file)

    $app.save(record) // dispara o hook de vínculo por CPF

    return e.json(200, {
      success: true,
      id: record.id,
      cpf: cpf,
      usuario_id: record.getString('usuario_id'),
      pendente: !record.getString('usuario_id'),
    })
  } catch (err) {
    $app.logger().error('Erro no intake de bioimpedância', 'error', String(err))
    return e.json(500, { error: 'Falha ao anexar bioimpedância.' })
  }
})
