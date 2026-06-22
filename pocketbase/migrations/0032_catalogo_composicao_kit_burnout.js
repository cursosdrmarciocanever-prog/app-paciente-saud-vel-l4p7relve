/// <reference path="../pb_data/types.d.ts" />

// Adiciona campo "composicao" ao catálogo (para kits/protocolos com vários
// ativos) e semeia o Kit "Protocolo para Síndrome de Burnout".
const COMPOSICAO_BURNOUT = [
  'NMN Mono Nicot 100mg/1mL',
  'Alfa GPC (98%) 150mg/1mL',
  'L-Theanina (2,5%) 50mg/2mL',
  'Amp Acetil L-Tirosina 20mg/2mL',
  'Sulfato de Magnésio (10%) 200mg/2mL',
  'Amp Ino 100mg + Tau 100mg/2mL',
  'Amp Complexo B s/ B1/2mL',
  'D-Ribose (25%) 500mg/2mL',
  'Vitamina C - Ácido Ascórbico (20%) 400mg/2mL',
].join('\n')

migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('catalogo_injetaveis')
    if (!col.fields.getByName('composicao')) {
      col.fields.add(new TextField({ name: 'composicao', required: false }))
      app.save(col)
    }

    const fresh = app.findCollectionByNameOrId('catalogo_injetaveis')
    const kit = new Record(fresh)
    kit.set('produto', 'Protocolo para Síndrome de Burnout')
    kit.set('tipo', 'Kit')
    kit.set(
      'funcao',
      'Protocolo injetável de suporte em quadros de esgotamento (burnout), combinando nutrientes, aminoácidos e vitaminas voltados à energia, foco e equilíbrio do sistema nervoso.',
    )
    kit.set('via_administracao', 'Intramuscular / Endovenosa')
    kit.set('composicao', COMPOSICAO_BURNOUT)
    kit.set('ativo', true)
    app.save(kit)
  },
  (app) => {
    try {
      const recs = app.findRecordsByFilter(
        'catalogo_injetaveis',
        'produto = "Protocolo para Síndrome de Burnout"',
        '',
        10,
        0,
      )
      for (const r of recs) app.delete(r)
    } catch (e) {
      /* ignora */
    }
    const col = app.findCollectionByNameOrId('catalogo_injetaveis')
    const f = col.fields.getByName('composicao')
    if (f) {
      col.fields.removeById(f.id)
      app.save(col)
    }
  },
)
