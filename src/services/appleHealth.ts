import { Capacitor } from '@capacitor/core'
import { Health } from 'capacitor-health'
import pb from '@/lib/pocketbase/client'

// Disponível apenas no app nativo iOS (Apple Watch via HealthKit).
export const healthDisponivel = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return false
  try {
    const r = await Health.isHealthAvailable()
    return !!r.available
  } catch (_) {
    return false
  }
}

// Mapeia o tipo de treino do HealthKit para os tipos do nosso app.
function mapearTipo(workoutType: string): string {
  const t = (workoutType || '').toLowerCase()
  if (t.includes('run')) return 'corrida'
  if (t.includes('walk') || t.includes('hik')) return 'caminhada'
  if (t.includes('cycl') || t.includes('bik')) return 'ciclismo'
  if (t.includes('swim')) return 'natacao'
  if (t.includes('strength') || t.includes('weight')) return 'musculacao'
  if (t.includes('yoga')) return 'yoga'
  if (t.includes('functional') || t.includes('hiit') || t.includes('core')) return 'funcional'
  return 'outro'
}

export interface ResultadoSync {
  importados: number
  total: number
}

// Pede permissão, lê os treinos dos últimos `dias` e cria os que ainda não existem.
export const sincronizarAppleWatch = async (
  usuarioId: string,
  dias = 90,
): Promise<ResultadoSync> => {
  await Health.requestHealthPermissions({
    permissions: ['READ_WORKOUTS', 'READ_ACTIVE_CALORIES', 'READ_HEART_RATE', 'READ_STEPS'],
  })

  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - dias)

  const { workouts } = await Health.queryWorkouts({
    startDate: inicio.toISOString(),
    endDate: fim.toISOString(),
    includeHeartRate: false,
    includeRoute: false,
    includeSteps: false,
  })

  // IDs já importados deste usuário (para não duplicar)
  const existentes = await pb.collection('atividades_fisicas').getFullList({
    filter: `usuario_id = "${usuarioId}" && origem = "apple_watch"`,
    fields: 'origem_id',
  })
  const jaImportados = new Set(existentes.map((r: { origem_id?: string }) => r.origem_id))

  let importados = 0
  for (const w of workouts) {
    const origemId = w.id || `${w.startDate}_${w.workoutType}`
    if (jaImportados.has(origemId)) continue

    const inicioMs = new Date(w.startDate).getTime()
    const fimMs = new Date(w.endDate).getTime()
    const duracaoMin = Math.max(1, Math.round((fimMs - inicioMs) / 60000))

    try {
      await pb.collection('atividades_fisicas').create({
        usuario_id: usuarioId,
        tipo: mapearTipo(w.workoutType),
        duracao_minutos: duracaoMin,
        data: w.startDate.slice(0, 10),
        calorias: w.calories ? Math.round(w.calories) : undefined,
        observacoes: `Importado do Apple Watch${w.sourceName ? ` (${w.sourceName})` : ''}`,
        origem: 'apple_watch',
        origem_id: origemId,
      })
      importados++
    } catch (_) {
      // ignora um treino com erro e segue
    }
  }

  return { importados, total: workouts.length }
}
