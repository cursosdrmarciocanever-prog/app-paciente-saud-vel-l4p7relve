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
  const arquivoB64 = String(body.arquivo_base64 || '')
  const nomeArquivo = String(body.nome_arquivo || 'bioimpedancia.pdf')

  if (cpf.length !== 11) return e.json(400, { error: 'CPF inválido (11 dígitos).' })
  if (!dataMedicao) return e.json(400, { error: 'data_medicao é obrigatória.' })
  if (!arquivoUrl && !arquivoB64) {
    return e.json(400, { error: 'Envie arquivo_url ou arquivo_base64.' })
  }

  // Decodifica base64 -> bytes (sem atob/Buffer no JSVM; implementação manual).
  const b64ToBytes = (b64) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    const lookup = {}
    for (let i = 0; i < chars.length; i++) lookup[chars.charAt(i)] = i
    const clean = b64.replace(/[^A-Za-z0-9+/]/g, '')
    const out = []
    for (let i = 0; i < clean.length; i += 4) {
      let e1 = lookup[clean.charAt(i)]
      let e2 = lookup[clean.charAt(i + 1)]
      let e3 = lookup[clean.charAt(i + 2)]
      let e4 = lookup[clean.charAt(i + 3)]
      if (e1 === undefined) e1 = 0
      if (e2 === undefined) e2 = 0
      const has3 = clean.charAt(i + 2) !== ''
      const has4 = clean.charAt(i + 3) !== ''
      if (e3 === undefined) e3 = 0
      if (e4 === undefined) e4 = 0
      const n = (e1 << 18) | (e2 << 12) | (e3 << 6) | e4
      out.push((n >> 16) & 0xff)
      if (has3) out.push((n >> 8) & 0xff)
      if (has4) out.push(n & 0xff)
    }
    return Uint8Array.from(out)
  }

  try {
    const col = $app.findCollectionByNameOrId('bioimpedancia_pdf')
    const record = new Record(col)
    record.set('cpf', cpf)
    record.set('data_medicao', dataMedicao)

    let file
    if (arquivoB64) {
      // remove prefixo data: se vier (ex.: "data:application/pdf;base64,....")
      const pure = arquivoB64.indexOf(',') >= 0 ? arquivoB64.split(',')[1] : arquivoB64
      file = $filesystem.fileFromBytes(b64ToBytes(pure), nomeArquivo)
    } else {
      file = $filesystem.fileFromURL(arquivoUrl)
      file.originalName = nomeArquivo
    }
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
