import pb from '@/lib/pocketbase/client'

export type TipoAtividade =
  | 'caminhada'
  | 'corrida'
  | 'musculacao'
  | 'natacao'
  | 'ciclismo'
  | 'yoga'
  | 'funcional'
  | 'outro'

export interface AtividadeFisica {
  id: string
  usuario_id: string
  tipo: TipoAtividade
  duracao_minutos: number
  data: string
  calorias?: number
  observacoes?: string
  created: string
  updated: string
}

export const TIPO_ATIVIDADE_LABEL: Record<TipoAtividade, string> = {
  caminhada: 'Caminhada',
  corrida: 'Corrida',
  musculacao: 'Musculação',
  natacao: 'Natação',
  ciclismo: 'Ciclismo',
  yoga: 'Yoga',
  funcional: 'Funcional',
  outro: 'Outro',
}

export const getAtividades = async (usuarioId: string) => {
  return pb.collection('atividades_fisicas').getFullList<AtividadeFisica>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-data,-created',
  })
}

export const criarAtividade = async (data: Partial<AtividadeFisica>) => {
  return pb.collection('atividades_fisicas').create<AtividadeFisica>(data)
}

export const deletarAtividade = async (id: string) => {
  return pb.collection('atividades_fisicas').delete(id)
}
