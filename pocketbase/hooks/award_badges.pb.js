/// <reference path="../pb_data/types.d.ts" />

// Concede badges automaticamente quando o paciente registra atividade física,
// refeição ou hidratação. Toda a lógica fica INLINE dentro do handler porque o
// JSVM do PocketBase executa cada callback isolado (não enxerga funções do topo).

const avaliarEConceder = (e) => {
  try {
    const userId = e.record.getString('usuario_id')
    if (!userId) {
      e.next()
      return
    }

    const contar = (col) =>
      $app.findRecordsByFilter(col, 'usuario_id = {:u}', '', 2000, 0, { u: userId }).length
    const counts = {
      atividades: contar('atividades_fisicas'),
      refeicoes: contar('refeicoes'),
      hidratacao_dias: contar('hidratacao'),
    }

    const userBadgesCol = $app.findCollectionByNameOrId('user_badges')
    const badges = $app.findRecordsByFilter('badges', "id != ''", 'ordem', 500, 0)

    for (const badge of badges) {
      const tipo = badge.getString('tipo_criterio')
      const meta = Number(badge.get('meta'))
      if (!(tipo in counts) || counts[tipo] < meta) continue

      // já possui este badge?
      try {
        $app.findFirstRecordByFilter('user_badges', 'usuario_id = {:u} && badge_id = {:b}', {
          u: userId,
          b: badge.id,
        })
        continue
      } catch (_) {
        // não possui -> conceder
      }

      const rec = new Record(userBadgesCol)
      rec.set('usuario_id', userId)
      rec.set('badge_id', badge.id)
      rec.set('desbloqueado_em', new Date().toISOString().replace('T', ' '))
      $app.save(rec)
    }
  } catch (err) {
    $app.logger().error('Erro no award_badges', 'error', String(err))
  }
  e.next()
}

onRecordAfterCreateSuccess(avaliarEConceder, 'atividades_fisicas')
onRecordAfterCreateSuccess(avaliarEConceder, 'refeicoes')
onRecordAfterCreateSuccess(avaliarEConceder, 'hidratacao')
