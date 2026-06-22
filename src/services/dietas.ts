import pb from '@/lib/pocketbase/client'

export interface Dieta {
  id: string
  usuario_id: string
  titulo: string
  conteudo: string
  origem?: 'assistente' | 'admin'
  created: string
  updated: string
}

export const getDietas = (usuarioId: string) =>
  pb.collection('dietas').getFullList<Dieta>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-created',
  })

export const criarDieta = (data: {
  usuario_id: string
  titulo: string
  conteudo: string
  origem: 'assistente' | 'admin'
}) => pb.collection('dietas').create<Dieta>(data)

export const excluirDieta = (id: string) => pb.collection('dietas').delete(id)
