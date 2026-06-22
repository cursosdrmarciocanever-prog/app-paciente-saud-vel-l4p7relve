/// <reference path="../pb_data/types.d.ts" />

// Semente de exemplos para a prateleira de injetáveis (catalogo_injetaveis).
// São apenas EXEMPLOS editáveis pelo admin (produto, função, valor).
const SEED_0031 = [
  {
    produto: 'Vitamina C Injetável',
    tipo: 'Vitamina',
    funcao:
      'Antioxidante que auxilia na imunidade e na produção natural de colágeno, contribuindo para a saúde da pele.',
    via: 'Endovenosa',
    valor: 90,
  },
  {
    produto: 'Complexo B (B12)',
    tipo: 'Vitamina',
    funcao:
      'Conjunto de vitaminas do complexo B que apoiam o metabolismo energético e o funcionamento do sistema nervoso.',
    via: 'Intramuscular',
    valor: 70,
  },
  {
    produto: 'Glutationa',
    tipo: 'Antioxidante',
    funcao:
      'Antioxidante associado à detoxificação e à saúde da pele, ajudando a combater o estresse oxidativo.',
    via: 'Endovenosa',
    valor: 130,
  },
  {
    produto: 'L-Carnitina',
    tipo: 'Aminoácido',
    funcao:
      'Auxilia o metabolismo de gorduras como fonte de energia e pode contribuir para a disposição física.',
    via: 'Intramuscular',
    valor: 95,
  },
  {
    produto: 'Taurina',
    tipo: 'Aminoácido',
    funcao:
      'Aminoácido associado à produção de energia, foco e recuperação após esforço físico.',
    via: 'Intramuscular',
    valor: 60,
  },
]

migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('catalogo_injetaveis')
    for (const it of SEED_0031) {
      const r = new Record(col)
      r.set('produto', it.produto)
      r.set('tipo', it.tipo)
      r.set('funcao', it.funcao)
      r.set('via_administracao', it.via)
      r.set('valor', it.valor)
      r.set('ativo', true)
      app.save(r)
    }
  },
  (app) => {
    for (const it of SEED_0031) {
      try {
        const recs = app.findRecordsByFilter(
          'catalogo_injetaveis',
          'produto = "' + it.produto + '"',
          '',
          10,
          0,
        )
        for (const r of recs) app.delete(r)
      } catch (e) {
        /* ignora */
      }
    }
  },
)
