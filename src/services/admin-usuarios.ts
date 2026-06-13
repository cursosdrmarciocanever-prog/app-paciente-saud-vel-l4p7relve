import pb from '@/lib/pocketbase/client'

export interface AdminUserMerged {
  id: string
  name: string
  email: string
  created: string
  plano: string
  status: string
  assinatura_id: string
  ultima_consulta: string
}

export const getAdminUsuarios = async (): Promise<AdminUserMerged[]> => {
  return pb.send('/backend/v1/admin/usuarios', { method: 'GET' })
}

export const updateAssinaturaStatus = async (id: string, status: string) => {
  return pb.send(`/backend/v1/admin/assinaturas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const deleteAdminUsuario = async (id: string) => {
  return pb.send(`/backend/v1/admin/usuarios/${id}`, { method: 'DELETE' })
}

export const activateBonusSubscription = async (id: string) => {
  return pb.send(`/backend/v1/admin/usuarios/${id}/assinatura-bonus`, { method: 'POST' })
}
