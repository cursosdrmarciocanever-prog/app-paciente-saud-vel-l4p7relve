import pb from '@/lib/pocketbase/client'
import { comToken } from '@/lib/pocketbase/fileToken'

export interface PacienteResumo {
  id: string
  name: string
  email: string
  cpf?: string
}

// Busca pacientes por nome, e-mail ou CPF (apenas admin).
// Usa o endpoint admin (contexto elevado) porque a coleção `users` é restrita
// a "próprio registro" — listar todos só é possível via este hook.
export const buscarPacientes = async (termo: string): Promise<PacienteResumo[]> => {
  const t = termo.trim().toLowerCase()
  if (!t) return []
  const lista = await pb.send<any[]>('/backend/v1/admin/usuarios', { method: 'GET' })
  return (lista || [])
    .filter((u) => {
      const alvo = `${u.name || ''} ${u.email || ''} ${u.cpf || ''}`.toLowerCase()
      return alvo.includes(t)
    })
    .slice(0, 20)
    .map((u) => ({ id: u.id, name: u.name || u.email, email: u.email, cpf: u.cpf }))
}

export const getFotosDoPaciente = (usuarioId: string) =>
  pb.collection('fotos_paciente').getFullList({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-created',
  })

export const getExamesDoPaciente = (usuarioId: string) =>
  pb.collection('exames_pdf').getFullList({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-data_exame',
  })

export const getBiosDoPaciente = (usuarioId: string) =>
  pb.collection('bioimpedancia_pdf').getFullList({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-data_medicao',
  })

export const fileUrl = (record: any, campo: string) =>
  comToken(pb.files.getURL(record, record[campo]))
