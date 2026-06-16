/// <reference path="../pb_data/types.d.ts" />

// Suporte à importação de treinos do Apple Watch / Health Connect:
// 'origem' (ex.: apple_watch) e 'origem_id' (id do treino na fonte) para evitar
// duplicar o mesmo treino em sincronizações repetidas.
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('atividades_fisicas')
    if (!col.fields.getByName('origem')) {
      col.fields.add(new TextField({ name: 'origem', required: false }))
    }
    if (!col.fields.getByName('origem_id')) {
      col.fields.add(new TextField({ name: 'origem_id', required: false }))
    }
    col.addIndex('idx_atividades_origem', false, 'usuario_id, origem_id', '')
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('atividades_fisicas')
      col.removeIndex('idx_atividades_origem')
      col.fields.removeByName('origem')
      col.fields.removeByName('origem_id')
      app.save(col)
    } catch (_) {}
  },
)
