import pb from '@/lib/pocketbase/client'

export interface FotoPaciente {
  id: string
  usuario_id: string
  foto: string
  descricao: string
  created: string
  updated: string
}

export const getFotos = async (usuarioId: string) => {
  return pb.collection('fotos_paciente').getFullList<FotoPaciente>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-created',
  })
}

export const uploadFoto = async (data: FormData) => {
  return pb.collection('fotos_paciente').create<FotoPaciente>(data)
}

export const deleteFoto = async (id: string) => {
  return pb.collection('fotos_paciente').delete(id)
}
