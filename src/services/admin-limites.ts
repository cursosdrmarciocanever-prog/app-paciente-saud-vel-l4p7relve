import pb from '@/lib/pocketbase/client'

export interface LimitePlano {
  id: string
  plano: string
  limite_mensagens: number
  limite_fotos: number
}

export const listarLimites = () =>
  pb.collection('limites_plano').getFullList<LimitePlano>({ sort: 'plano' })

export const salvarLimite = (id: string, data: Partial<LimitePlano>) =>
  pb.collection('limites_plano').update<LimitePlano>(id, data)

export const criarLimite = (data: Omit<LimitePlano, 'id'>) =>
  pb.collection('limites_plano').create<LimitePlano>(data)

export const excluirLimite = (id: string) => pb.collection('limites_plano').delete(id)
