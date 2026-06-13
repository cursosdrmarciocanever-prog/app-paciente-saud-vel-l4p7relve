import pb from '@/lib/pocketbase/client'

export interface Assinatura {
  id: string
  usuario_id: string
  plano: string
  status: string
  data_inicio: string
  data_renovacao: string
  stripe_subscription_id: string
  created: string
  updated: string
}

export const getAssinaturas = async (): Promise<Assinatura[]> => {
  return pb.collection('assinaturas').getFullList<Assinatura>({
    sort: '-created',
  })
}
