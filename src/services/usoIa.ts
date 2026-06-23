import pb from '@/lib/pocketbase/client'
import { getAssinaturas } from './assinaturas'

export interface ResumoUsoIa {
  mensagensUsadas: number
  fotosUsadas: number
  limiteMensagens: number
  limiteFotos: number
}

const mesAtual = () => new Date().toISOString().slice(0, 7) // "YYYY-MM"

// Resumo de uso de IA do paciente no mês atual + limites do seu plano.
// Retorna null se o paciente não tem assinatura ativa (sem limites a exibir).
export async function getResumoUsoIa(): Promise<ResumoUsoIa | null> {
  const uid = pb.authStore.model?.id
  if (!uid) return null

  let plano = ''
  try {
    const assinaturas = await getAssinaturas()
    const ativa = assinaturas.find((a) => ['ativo', 'active', 'ativa'].includes(a.status))
    if (!ativa) return null
    plano = ativa.plano || ''
  } catch (_) {
    return null
  }

  // Limites do plano (cai em "default" se o plano não tiver linha própria).
  let limiteMensagens = 0
  let limiteFotos = 0
  try {
    let lim: { limite_mensagens?: number; limite_fotos?: number } | null = null
    if (plano) {
      try {
        lim = await pb.collection('limites_plano').getFirstListItem(`plano="${plano}"`)
      } catch (_) {
        /* sem linha p/ esse plano */
      }
    }
    if (!lim) lim = await pb.collection('limites_plano').getFirstListItem('plano="default"')
    limiteMensagens = lim?.limite_mensagens || 0
    limiteFotos = lim?.limite_fotos || 0
  } catch (_) {
    /* sem limites configurados */
  }

  // Uso do mês.
  let mensagensUsadas = 0
  let fotosUsadas = 0
  try {
    const u = await pb
      .collection('uso_ia')
      .getFirstListItem<{ mensagens_ia?: number; fotos_analisadas?: number }>(
        `usuario_id="${uid}" && mes="${mesAtual()}"`,
      )
    mensagensUsadas = u.mensagens_ia || 0
    fotosUsadas = u.fotos_analisadas || 0
  } catch (_) {
    /* ainda não usou nada este mês */
  }

  return { mensagensUsadas, fotosUsadas, limiteMensagens, limiteFotos }
}
