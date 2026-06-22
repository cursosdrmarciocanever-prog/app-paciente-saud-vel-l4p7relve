import pb from '@/lib/pocketbase/client'
import { z } from 'zod'
import { ClientResponseError } from 'pocketbase'

export type AgenteTipo = 'geral' | 'exames' | 'nutricional' | 'medico'

export const conversaSchema = z.object({
  usuario_id: z.string().min(1, 'Usuário é obrigatório'),
  titulo: z.string().optional(),
  status: z.enum(['ativa', 'encerrada']).default('ativa'),
  agente: z.enum(['geral', 'exames', 'nutricional', 'medico']).optional(),
})

export const mensagemSchema = z.object({
  conversa_id: z.string().min(1, 'Conversa é obrigatória'),
  usuario_id: z.string().min(1, 'Usuário é obrigatório'),
  remetente: z.enum(['paciente', 'agente_ia']),
  conteudo: z.string().min(1, 'A mensagem não pode ser vazia'),
})

export type Conversa = z.infer<typeof conversaSchema> & {
  id: string
  created: string
  updated: string
  expand?: any
}
export type Mensagem = z.infer<typeof mensagemSchema> & {
  id: string
  created: string
  updated: string
  expand?: any
}

function logDiagnostic(action: string, error: any) {
  let status = 500
  if (error instanceof ClientResponseError) {
    status = error.status
  } else if (error?.status !== undefined) {
    status = error.status
  } else if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    status = 0
  }

  console.error(`[Diagnostic] ${action} failed with status ${status}`, error)

  if ([401, 403].includes(status)) {
    console.error(`[Diagnostic] Permission issue detected on ${action} (Status ${status})`)
  } else if ([404, 500].includes(status)) {
    console.error(`[Diagnostic] Infrastructure or mapping failure on ${action} (Status ${status})`)
  } else if (status === 0) {
    console.error(`[Diagnostic] Network/CORS/Connection failure on ${action} (Status ${status})`)
  }
}

export const createConversa = async (data: z.infer<typeof conversaSchema>) => {
  try {
    const parsed = conversaSchema.parse(data)
    return await pb.collection('conversas_suporte').create<Conversa>(parsed)
  } catch (error: any) {
    logDiagnostic('createConversa', error)
    throw error
  }
}

export const getConversas = async (usuarioId?: string, agente?: AgenteTipo) => {
  try {
    const partes: string[] = []
    if (usuarioId) partes.push(`usuario_id = "${usuarioId}"`)
    if (agente) partes.push(`agente = "${agente}"`)
    return await pb.collection('conversas_suporte').getFullList<Conversa>({
      filter: partes.join(' && '),
      sort: '-updated',
      expand: 'usuario_id',
    })
  } catch (error: any) {
    logDiagnostic('getConversas', error)
    throw error
  }
}

export const updateConversaStatus = async (id: string, status: 'ativa' | 'encerrada') => {
  try {
    return await pb.collection('conversas_suporte').update<Conversa>(id, { status })
  } catch (error: any) {
    logDiagnostic('updateConversaStatus', error)
    throw error
  }
}

export const getMensagens = async (conversaId: string, usuarioId?: string) => {
  try {
    let filter = `conversa_id = "${conversaId}"`
    if (usuarioId) {
      filter += ` && usuario_id = "${usuarioId}"`
    }
    return await pb.collection('mensagens_suporte').getFullList<Mensagem>({
      filter,
      sort: 'created',
    })
  } catch (error: any) {
    logDiagnostic('getMensagens', error)
    throw error
  }
}

export const createMensagem = async (data: z.infer<typeof mensagemSchema>) => {
  try {
    const parsed = mensagemSchema.parse(data)
    return await pb.collection('mensagens_suporte').create<Mensagem>(parsed)
  } catch (error: any) {
    logDiagnostic('createMensagem', error)
    throw error
  }
}
