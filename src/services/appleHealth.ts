import { Capacitor } from '@capacitor/core'
import { Health } from '@flomentumsolutions/capacitor-health-extended'
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

export interface ResumoDiario {
  passos: number
  calorias: number
}

// Lê passos + calorias ativas de HOJE direto do HealthKit (ao vivo, sem persistir).
export const getResumoHoje = async (): Promise<ResumoDiario | null> => {
  if (!(await healthDisponivel())) return null

  await Health.requestHealthPermissions({
    permissions: ['READ_STEPS', 'READ_ACTIVE_CALORIES'],
  })

  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date()

  const somar = async (dataType: 'steps' | 'active-calories'): Promise<number> => {
    try {
      const { aggregatedData } = await Health.queryAggregated({
        startDate: inicio.toISOString(),
        endDate: fim.toISOString(),
        dataType,
        bucket: 'day',
      })
      return Math.round(aggregatedData.reduce((acc, s) => acc + (s.value || 0), 0))
    } catch (_) {
      return 0
    }
  }

  const [passos, calorias] = await Promise.all([somar('steps'), somar('active-calories')])
  return { passos, calorias }
}

export interface DiaPassos {
  dia: string // YYYY-MM-DD
  passos: number
}

// Lê o histórico de passos dos últimos `dias` dias (um balde por dia), para
// montar um mini-gráfico. Cobre qualquer relógio sincronizado ao Apple Saúde
// (Apple Watch, Amazfit/Zepp, Garmin, etc.).
export const getHistoricoPassos = async (dias = 7): Promise<DiaPassos[]> => {
  if (!(await healthDisponivel())) return []

  await Health.requestHealthPermissions({ permissions: ['READ_STEPS'] })

  const fim = new Date()
  fim.setHours(23, 59, 59, 999)
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - (dias - 1))
  inicio.setHours(0, 0, 0, 0)

  // Esqueleto com todos os dias zerados (garante a sequência mesmo sem dados).
  const mapa = new Map<string, number>()
  for (let i = 0; i < dias; i++) {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    mapa.set(d.toISOString().slice(0, 10), 0)
  }

  try {
    const { aggregatedData } = await Health.queryAggregated({
      startDate: inicio.toISOString(),
      endDate: fim.toISOString(),
      dataType: 'steps',
      bucket: 'day',
    })
    for (const s of aggregatedData) {
      const dia = new Date(s.startDate).toISOString().slice(0, 10)
      if (mapa.has(dia)) mapa.set(dia, Math.round((mapa.get(dia) || 0) + (s.value || 0)))
    }
  } catch (_) {
    /* sem dados — devolve o esqueleto zerado */
  }

  return Array.from(mapa.entries()).map(([dia, passos]) => ({ dia, passos }))
}

// Frequência cardíaca de REPOUSO mais recente (bpm). Vem de qualquer relógio
// sincronizado ao Apple Saúde. Retorna null se indisponível.
export const getFcRepouso = async (): Promise<number | null> => {
  if (!(await healthDisponivel())) return null
  try {
    await Health.requestHealthPermissions({ permissions: ['READ_RESTING_HEART_RATE'] })
    const r = await Health.queryLatestSample({ dataType: 'resting-heart-rate' })
    return r && typeof r.value === 'number' && r.value > 0 ? Math.round(r.value) : null
  } catch (_) {
    return null
  }
}

export interface ResumoSono {
  minutos: number // duração total dormida
  inicio: number // epoch ms
  fim: number // epoch ms
}

// Última sessão de SONO (do Apple Saúde / Health Connect). A duração vem do
// `value` quando disponível; senão é calculada pelos horários de início/fim.
export const getSono = async (): Promise<ResumoSono | null> => {
  if (!(await healthDisponivel())) return null
  try {
    await Health.requestHealthPermissions({ permissions: ['READ_SLEEP'] })
    const r = await Health.queryLatestSample({ dataType: 'sleep' })
    if (!r || !r.timestamp) return null
    const inicio = r.timestamp
    const fim = r.endTimestamp || r.timestamp
    let minutos = typeof r.value === 'number' && r.value > 0 ? Math.round(r.value) : 0
    // Heurística de unidade: alguns retornos vêm em horas ou segundos.
    if (minutos > 0) {
      if (/h|hour|hora/i.test(r.unit || '') && minutos <= 24) minutos = Math.round(minutos * 60)
      else if (/s|sec|seg/i.test(r.unit || '') && minutos > 1440) minutos = Math.round(minutos / 60)
    }
    if (!minutos && fim > inicio) minutos = Math.round((fim - inicio) / 60000)
    if (!minutos) return null
    return { minutos, inicio, fim }
  } catch (_) {
    return null
  }
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
