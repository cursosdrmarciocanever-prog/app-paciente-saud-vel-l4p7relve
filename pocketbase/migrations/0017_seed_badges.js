/// <reference path="../pb_data/types.d.ts" />

// Seed inicial de conquistas (badges). Critérios:
//  - tipo_criterio 'atividades'      -> nº total de atividades físicas registradas
//  - tipo_criterio 'refeicoes'       -> nº total de refeições registradas
//  - tipo_criterio 'hidratacao_dias' -> nº de dias distintos com hidratação registrada
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('badges')

    const seed = [
      ['Primeiro Passo', 'Registrou sua primeira atividade física.', '🥾', 'atividades', 1, 1],
      ['Em Movimento', 'Registrou 5 atividades físicas.', '🏃', 'atividades', 5, 2],
      ['Determinação', 'Registrou 15 atividades físicas.', '💪', 'atividades', 15, 3],
      ['Guerreiro de Ouro', 'Registrou 30 atividades físicas.', '🏆', 'atividades', 30, 4],
      ['Prato Saudável', 'Registrou sua primeira refeição no diário.', '🍽️', 'refeicoes', 1, 5],
      ['Nutrição em Foco', 'Registrou 20 refeições no diário.', '🥗', 'refeicoes', 20, 6],
      ['Bem Hidratado', 'Registrou hidratação por 3 dias.', '💧', 'hidratacao_dias', 3, 7],
      ['Fonte de Vida', 'Registrou hidratação por 7 dias.', '🌊', 'hidratacao_dias', 7, 8],
    ]

    for (const [nome, descricao, icone, tipo_criterio, meta, ordem] of seed) {
      try {
        app.findFirstRecordByData('badges', 'nome', nome)
      } catch (_) {
        const r = new Record(col)
        r.set('nome', nome)
        r.set('descricao', descricao)
        r.set('icone', icone)
        r.set('tipo_criterio', tipo_criterio)
        r.set('meta', meta)
        r.set('ordem', ordem)
        app.save(r)
      }
    }
  },
  (app) => {
    for (const nome of [
      'Primeiro Passo',
      'Em Movimento',
      'Determinação',
      'Guerreiro de Ouro',
      'Prato Saudável',
      'Nutrição em Foco',
      'Bem Hidratado',
      'Fonte de Vida',
    ]) {
      try {
        app.delete(app.findFirstRecordByData('badges', 'nome', nome))
      } catch (_) {}
    }
  },
)
