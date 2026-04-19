migrate(
  (app) => {
    const badges = app.findCollectionByNameOrId('badges')

    const seedData = [
      {
        name: 'Primeiro Passo',
        description: 'Completou sua primeira atividade física registrada.',
        type: 'first_log',
        requirement_value: 1,
      },
      {
        name: 'Determinação Bronze',
        description: 'Manteve sua meta diária por 3 dias consecutivos.',
        type: 'streak_days',
        requirement_value: 3,
      },
      {
        name: 'Guerreiro de Ouro',
        description: 'Manteve sua meta diária por 7 dias consecutivos.',
        type: 'streak_days',
        requirement_value: 7,
      },
      {
        name: 'Foco Total',
        description: 'Atingiu a meta semanal de dias de treino.',
        type: 'weekly_goals_met',
        requirement_value: 1,
      },
    ]

    seedData.forEach((data) => {
      try {
        app.findFirstRecordByData('badges', 'name', data.name)
      } catch (_) {
        const record = new Record(badges)
        record.set('name', data.name)
        record.set('description', data.description)
        record.set('type', data.type)
        record.set('requirement_value', data.requirement_value)
        app.save(record)
      }
    })
  },
  (app) => {
    // Skip down migration for seed data to avoid accidentally dropping user content
  },
)
