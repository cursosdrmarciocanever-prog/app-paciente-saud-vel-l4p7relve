migrate(
  (app) => {
    const injetaveis = app.findCollectionByNameOrId('injetaveis')

    const items = [
      {
        nome: 'Vitamina B12 Complex',
        descricao:
          'Suplementação injetável de Vitamina B12 para aumento de energia e melhora metabólica.',
        funcionalidades: 'Aumento de energia, melhora da memória, suporte ao sistema nervoso.',
        preco_ampola: 150.0,
        preco_kit: 600.0,
        quantidade_kit: 5,
        ativo: true,
      },
      {
        nome: 'Mix Antioxidante Max',
        descricao: 'Blend exclusivo de antioxidantes incluindo Glutationa e Vitamina C.',
        funcionalidades: 'Rejuvenescimento celular, clareamento da pele, imunidade.',
        preco_ampola: 280.0,
        preco_kit: 1200.0,
        quantidade_kit: 5,
        ativo: true,
      },
      {
        nome: 'Lipo Metabólico',
        descricao: 'Combinação de aminoácidos e L-Carnitina para auxiliar na queima de gordura.',
        funcionalidades: 'Aceleração metabólica, queima de gordura, definição muscular.',
        preco_ampola: 200.0,
        preco_kit: 850.0,
        quantidade_kit: 5,
        ativo: true,
      },
    ]

    for (const item of items) {
      try {
        app.findFirstRecordByData('injetaveis', 'nome', item.nome)
      } catch (_) {
        const record = new Record(injetaveis)
        record.set('nome', item.nome)
        record.set('descricao', item.descricao)
        record.set('funcionalidades', item.funcionalidades)
        record.set('preco_ampola', item.preco_ampola)
        record.set('preco_kit', item.preco_kit)
        record.set('quantidade_kit', item.quantidade_kit)
        record.set('ativo', item.ativo)
        app.save(record)
      }
    }
  },
  (app) => {
    const names = ['Vitamina B12 Complex', 'Mix Antioxidante Max', 'Lipo Metabólico']
    for (const name of names) {
      try {
        const record = app.findFirstRecordByData('injetaveis', 'nome', name)
        app.delete(record)
      } catch (_) {}
    }
  },
)
