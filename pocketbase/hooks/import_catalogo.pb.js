routerAdd(
  'POST',
  '/backend/v1/catalogo/import',
  (e) => {
    const body = e.requestInfo().body || {}

    let parsed = []

    if (body.items && Array.isArray(body.items)) {
      parsed = body.items
    } else {
      return e.badRequestError('Nenhum dado enviado.')
    }

    if (!parsed || parsed.length === 0) {
      return e.badRequestError('Nenhum dado válido encontrado no arquivo.')
    }

    const col = $app.findCollectionByNameOrId('catalogo_injetaveis')
    let importedCount = 0

    for (const row of parsed) {
      const getVal = (keys) => {
        for (const k of keys) {
          const foundKey = Object.keys(row).find(
            (rk) => rk.toLowerCase().trim() === k.toLowerCase().trim(),
          )
          if (foundKey !== undefined) return row[foundKey]
        }
        return null
      }

      let produto = getVal(['produto', 'nome', 'name'])
      if (!produto) continue

      let tipo = getVal(['tipo', 'type']) || ''
      let funcao = getVal(['função', 'funcao', 'function']) || ''
      let via =
        getVal([
          'via de administração',
          'via de administracao',
          'via',
          'via_administracao',
          'administração',
          'administracao',
        ]) || ''
      let posologia =
        getVal([
          'posologia recomendada',
          'ponsologia recomendada',
          'posologia',
          'ponsologia_recomendada',
          'ponsologia',
        ]) || ''
      let valorRaw = getVal(['valor', 'preco', 'preço', 'price']) || 0

      let valor = 0
      if (typeof valorRaw === 'number') {
        valor = valorRaw
      } else if (typeof valorRaw === 'string') {
        valor =
          parseFloat(valorRaw.replace('R$', '').trim().replace(/\./g, '').replace(',', '.')) || 0
      }

      const record = new Record(col)
      record.set('produto', String(produto).trim())
      record.set('tipo', String(tipo).trim())
      record.set('funcao', String(funcao).trim())
      record.set('via_administracao', String(via).trim())
      record.set('ponsologia_recomendada', String(posologia).trim())
      record.set('valor', valor)
      record.set('ativo', true)

      $app.save(record)
      importedCount++
    }

    if (importedCount === 0) {
      return e.badRequestError(
        "O arquivo foi processado, mas nenhum registro possuía a coluna 'produto' ou 'nome'.",
      )
    }

    return e.json(200, { imported: importedCount })
  },
  $apis.requireAuth(),
)
