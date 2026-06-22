/// <reference path="../pb_data/types.d.ts" />

// Busca de artigos científicos (apenas admin). Faz a consulta server-side
// (evita CORS) em fontes abertas: Europe PMC (PubMed/PMC/etc.) e CrossRef.
// Retorna resultados normalizados para o painel publicar como artigo.
routerAdd(
  'GET',
  '/backend/v1/admin/artigos-cientificos',
  (e) => {
    const auth = e.auth
    if (!auth) return e.forbiddenError('Acesso negado')
    const email = auth.email()
    if (email !== 'admin@canever.com.br' && email !== 'marciocanever@hotmail.com') {
      return e.forbiddenError('Acesso negado')
    }

    const info = e.requestInfo()
    const q = (info.query && info.query.q ? String(info.query.q) : '').trim()
    const fonte = (info.query && info.query.fonte ? String(info.query.fonte) : 'europepmc').toLowerCase()
    if (!q) return e.json(200, { resultados: [] })

    const enc = encodeURIComponent(q)
    let resultados = []

    try {
      if (fonte === 'crossref') {
        const r = $http.send({
          url: 'https://api.crossref.org/works?rows=15&query=' + enc,
          method: 'GET',
          headers: { 'User-Agent': 'ClinicaCanever/1.0 (mailto:contato@clinicacanever.com.br)' },
          timeout: 25,
        })
        const data = r.json || JSON.parse(r.raw || '{}')
        const items = (data.message && data.message.items) || []
        for (const it of items) {
          const autores = (it.author || [])
            .map(function (a) { return [a.given, a.family].filter(Boolean).join(' ') })
            .filter(Boolean)
            .join(', ')
          resultados.push({
            titulo: Array.isArray(it.title) ? it.title[0] : it.title || '',
            autores: autores,
            fonte: Array.isArray(it['container-title']) ? it['container-title'][0] : '',
            ano: it.created && it.created['date-parts'] ? String(it.created['date-parts'][0][0]) : '',
            resumo: (it.abstract || '').replace(/<[^>]+>/g, '').trim(),
            doi: it.DOI || '',
            link: it.URL || (it.DOI ? 'https://doi.org/' + it.DOI : ''),
          })
        }
      } else {
        const r = $http.send({
          url:
            'https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&pageSize=15&resultType=core&query=' +
            enc,
          method: 'GET',
          timeout: 25,
        })
        const data = r.json || JSON.parse(r.raw || '{}')
        const items = (data.resultList && data.resultList.result) || []
        for (const it of items) {
          let link = ''
          if (it.doi) link = 'https://doi.org/' + it.doi
          else if (it.pmid) link = 'https://pubmed.ncbi.nlm.nih.gov/' + it.pmid + '/'
          else if (it.id && it.source) link = 'https://europepmc.org/article/' + it.source + '/' + it.id
          resultados.push({
            titulo: it.title || '',
            autores: it.authorString || '',
            fonte: it.journalTitle || it.bookOrReportDetails || it.source || '',
            ano: it.pubYear || '',
            resumo: (it.abstractText || '').replace(/<[^>]+>/g, '').trim(),
            doi: it.doi || '',
            link: link,
          })
        }
      }
    } catch (err) {
      return e.json(200, { resultados: [], erro: String(err) })
    }

    return e.json(200, { resultados: resultados })
  },
  $apis.requireAuth(),
)
