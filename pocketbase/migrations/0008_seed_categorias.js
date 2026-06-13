migrate(
  (app) => {
    const categorias = [
      { nome: 'Saúde' },
      { nome: 'Nutrição' },
      { nome: 'Exercícios' },
      { nome: 'Bem-estar' },
    ]

    const col = app.findCollectionByNameOrId('categorias_conteudo')

    for (const cat of categorias) {
      try {
        app.findFirstRecordByData('categorias_conteudo', 'nome', cat.nome)
      } catch (_) {
        const record = new Record(col)
        record.set('nome', cat.nome)
        app.save(record)
      }
    }
  },
  (app) => {
    const nomes = ['Saúde', 'Nutrição', 'Exercícios', 'Bem-estar']
    for (const nome of nomes) {
      try {
        const record = app.findFirstRecordByData('categorias_conteudo', 'nome', nome)
        app.delete(record)
      } catch (_) {}
    }
  },
)
