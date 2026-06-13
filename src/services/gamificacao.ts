import pb from '@/lib/pocketbase/client'

export type TipoCriterio = 'atividades' | 'refeicoes' | 'hidratacao_dias'

export interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  tipo_criterio: TipoCriterio
  meta: number
  ordem: number
}

export interface UserBadge {
  id: string
  usuario_id: string
  badge_id: string
  desbloqueado_em: string
  created: string
  expand?: { badge_id?: Badge }
}

export const TIPO_CRITERIO_LABEL: Record<TipoCriterio, string> = {
  atividades: 'atividades registradas',
  refeicoes: 'refeições registradas',
  hidratacao_dias: 'dias de hidratação',
}

export const getBadges = async () => {
  return pb.collection('badges').getFullList<Badge>({ sort: 'ordem' })
}

export const getUserBadges = async (usuarioId: string) => {
  return pb.collection('user_badges').getFullList<UserBadge>({
    filter: `usuario_id = "${usuarioId}"`,
    expand: 'badge_id',
    sort: '-desbloqueado_em',
  })
}
