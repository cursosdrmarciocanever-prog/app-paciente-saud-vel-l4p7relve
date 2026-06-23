/// <reference path="../pb_data/types.d.ts" />

// Análise nutricional de FOTO de prato (assistente nutricional por imagem).
// Recebe a foto (data URL base64), chama o modelo de visão via OpenRouter e
// devolve a estimativa de macros para o paciente confirmar e gravar no Diário.
// Tudo inline (o handler do JSVM roda isolado e não enxerga funções externas).
routerAdd(
  'POST',
  '/backend/v1/nutricao/analisar-foto',
  (e) => {
    const auth = e.auth
    if (!auth) return e.json(401, { erro: 'Não autenticado' })

    // Gate premium: precisa de assinatura ativa (mesma regra do assistente nutri).
    let temAssinatura = false
    try {
      const assinaturas = $app.findRecordsByFilter(
        'assinaturas',
        'usuario_id = "' + auth.id + '" && (status = "ativo" || status = "active" || status = "ativa")',
        '-created',
        1,
        0,
      )
      if (assinaturas && assinaturas.length > 0) temAssinatura = true
    } catch (err) {
      $app.logger().error('NUTRI_FOTO assinatura check', 'error', String(err))
    }
    if (!temAssinatura) {
      return e.json(403, { erro: 'Recurso exclusivo para assinantes' })
    }

    const body = e.requestInfo().body || {}
    let imagem = body.imagem ? String(body.imagem) : ''
    if (!imagem) return e.json(400, { erro: 'Imagem não enviada' })
    // Aceita tanto data URL completa ("data:image/jpeg;base64,...") quanto base64 puro.
    if (imagem.indexOf('data:') !== 0) {
      imagem = 'data:image/jpeg;base64,' + imagem
    }

    const apiKey = $os.getenv('OPENROUTER_API_KEY')
    if (!apiKey) {
      $app.logger().error('NUTRI_FOTO sem OPENROUTER_API_KEY')
      return e.json(500, { erro: 'Serviço de análise indisponível' })
    }

    const system =
      'Você é um analisador nutricional de fotos de pratos de comida. ' +
      'Identifique os alimentos visíveis e estime a porção de cada um. ' +
      'Calcule a estimativa de calorias e macronutrientes do prato inteiro. ' +
      'Responda SOMENTE com um JSON válido, sem markdown, sem cercas de código, sem texto antes ou depois. ' +
      'Formato exato: {"descricao": string, "calorias": number, "proteinas": number, "carboidratos": number, "gorduras": number, "confianca": "alta"|"media"|"baixa", "observacao": string}. ' +
      '"descricao" = lista curta dos alimentos com a porção estimada (ex.: "150g arroz branco, 120g frango grelhado, salada de folhas"). ' +
      'calorias em kcal; proteinas, carboidratos e gorduras em GRAMAS (números, sem unidade). ' +
      '"observacao" = frase curta opcional (deixe "" se não houver). ' +
      'Os valores são ESTIMATIVAS aproximadas baseadas na imagem. ' +
      'Se a imagem NÃO for um prato/alimento, responda {"erro": "Não identifiquei um prato de comida na foto."}.'

    let resp
    try {
      resp = $http.send({
        url: 'https://openrouter.ai/api/v1/chat/completions',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://app.clinicacanever.com.br',
          'X-Title': 'Clinica Canever - Nutricao Foto',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4.6',
          max_tokens: 700,
          messages: [
            { role: 'system', content: system },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analise este prato e devolva o JSON com a estimativa nutricional.' },
                { type: 'image_url', image_url: { url: imagem } },
              ],
            },
          ],
        }),
        timeout: 45,
      })
    } catch (err) {
      $app.logger().error('NUTRI_FOTO openrouter send', 'error', String(err))
      return e.json(502, { erro: 'Falha ao analisar a imagem. Tente novamente.' })
    }

    const data = resp.json || JSON.parse(resp.raw || '{}')
    let texto = ''
    try {
      texto = String(data.choices[0].message.content || '')
    } catch (err) {
      $app.logger().error('NUTRI_FOTO parse choices', 'raw', String(resp.raw || ''))
      return e.json(502, { erro: 'Resposta inesperada da análise. Tente novamente.' })
    }

    // Limpa eventuais cercas de código ```json ... ``` que o modelo às vezes inclui.
    texto = texto.replace(/```json/gi, '').replace(/```/g, '').trim()
    // Recorta do primeiro { ao último } para tolerar texto residual.
    const ini = texto.indexOf('{')
    const fim = texto.lastIndexOf('}')
    if (ini >= 0 && fim > ini) texto = texto.substring(ini, fim + 1)

    let parsed
    try {
      parsed = JSON.parse(texto)
    } catch (err) {
      $app.logger().error('NUTRI_FOTO json invalido', 'texto', texto)
      return e.json(502, { erro: 'Não consegui interpretar a análise. Tente uma foto mais nítida.' })
    }

    if (parsed.erro) {
      return e.json(422, { erro: String(parsed.erro) })
    }

    const num = (v) => {
      const n = Number(v)
      return isNaN(n) || n < 0 ? 0 : Math.round(n)
    }
    return e.json(200, {
      descricao: String(parsed.descricao || '').trim(),
      calorias: num(parsed.calorias),
      proteinas: num(parsed.proteinas),
      carboidratos: num(parsed.carboidratos),
      gorduras: num(parsed.gorduras),
      confianca: ['alta', 'media', 'baixa'].indexOf(String(parsed.confianca)) >= 0 ? String(parsed.confianca) : 'media',
      observacao: String(parsed.observacao || '').trim(),
    })
  },
)
