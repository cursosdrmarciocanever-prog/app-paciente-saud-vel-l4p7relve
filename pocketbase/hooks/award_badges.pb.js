/// <reference path="../pb_data/types.d.ts" />

// Concede badges automaticamente quando o paciente registra atividade física,
// refeição ou hidratação. Cada badge tem tipo_criterio + meta; o usuário ganha
// o badge quando seu total daquele tipo atinge a meta.
//
// Observação: no PocketBase JSVM o callback roda em um contexto isolado e NÃO
// enxerga funções declaradas no escopo do arquivo. Por isso TODA a lógica fica
// dentro do handler, registrado para as três coleções.
//
// Contagens por usuário:
//  - atividades      -> nº de registros em atividades_fisicas
//  - refeicoes       -> nº de registros em refeicoes
//  - hidratacao_dias -> nº de registros em hidratacao (índice único por dia => dias distintos)

function handler(e) {
  try {
    const userId = e.record.getString('usuario_id')
    if (userId) {
      const counts = {
        atividades: $app.countRecords('atividades_fisicas', $dbx.hashExp({ usuario_id: userId })),
        refeicoes: $app.countRecords('refeicoes', $dbx.hashExp({ usuario_id: userId })),
        hidratacao_dias: $app.countRecords('hidratacao', $dbx.hashExp({ usuario_id: userId })),
      }

      const userBadgesCol = $app.findCollectionByNameOrId('user_badges')
      const badges = $app.findRecordsByFilter('badges', "id != ''", 'ordem', 500, 0)

      for (const badge of badges) {
        const tipo = badge.getString('tipo_criterio')
        const meta = badge.getInt('meta')
        if (!(tipo in counts) || counts[tipo] < meta) continue

        // já possui esse badge?
        let jaTem = false
        try {
          $app.findFirstRecordByFilter('user_badges', 'usuario_id = {:u} && badge_id = {:b}', {
            u: userId,
            b: badge.id,
          })
          jaTem = true
        } catch (_) {
          jaTem = false
        }
        if (jaTem) continue

        try {
          const rec = new Record(userBadgesCol)
          rec.set('usuario_id', userId)
          rec.set('badge_id', badge.id)
          rec.set('desbloqueado_em', new Date().toISOString().replace('T', ' '))
          $app.save(rec)
        } catch (err) {
          $app.logger().error('Falha ao conceder badge', 'badge', badge.id, 'error', String(err))
        }
      }
    }
  } catch (err) {
    $app.logger().error('Erro no award_badges', 'error', String(err))
  }
  return e.next()
}

onRecordAfterCreateSuccess(handler, 'atividades_fisicas')
onRecordAfterCreateSuccess(handler, 'refeicoes')
onRecordAfterCreateSuccess(handler, 'hidratacao')
