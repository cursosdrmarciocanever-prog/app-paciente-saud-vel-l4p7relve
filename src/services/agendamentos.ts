import pb from '@/lib/pocketbase/client'
import { z } from 'zod'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export interface SlotDisponivel {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  medico_id: string
  agendado: boolean
  tipo?: 'presencial' | 'telemedicina'
  created: string
  updated: string
}

export interface Agendamento {
  id: string
  usuario_id: string
  slot_id: string
  data_agendamento: string
  hora_agendamento: string
  status: 'confirmado' | 'cancelado' | 'realizado'
  tipo_consulta: 'presencial' | 'telemedicina'
  notas?: string
  created: string
  updated: string
  expand?: {
    slot_id?: SlotDisponivel
  }
}

export interface HistoricoElegibilidade {
  id: string
  usuario_id: string
  ultima_consulta?: string
  proxima_consulta_permitida?: string
  consultas_realizadas_ano: number
  created: string
  updated: string
}

export const agendamentoSchema = z.object({
  usuario_id: z.string().min(1, 'ID do usuário é obrigatório'),
  slot_id: z.string().min(1, 'ID do slot é obrigatório'),
  data_agendamento: z.string().min(1, 'Data do agendamento é obrigatória'),
  hora_agendamento: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora inválida (use HH:mm)'),
  status: z.enum(['confirmado', 'cancelado', 'realizado']),
  tipo_consulta: z.enum(['presencial', 'telemedicina']),
  notas: z.string().optional(),
})

export type AgendamentoPayload = z.infer<typeof agendamentoSchema>

export async function getSlotsDisponiveis(from?: Date, to?: Date) {
  try {
    let filter = 'agendado = false'
    if (from) {
      const fromStr = from.toISOString().split('T')[0]
      filter += ` && data >= "${fromStr} 00:00:00.000Z"`
    }
    if (to) {
      const toStr = to.toISOString().split('T')[0]
      filter += ` && data <= "${toStr} 23:59:59.999Z"`
    }

    const data = await pb.collection('slots_disponiveis').getFullList<SlotDisponivel>({
      filter,
      sort: 'data,hora_inicio',
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: 'Erro ao carregar slots: ' + getErrorMessage(error) }
  }
}

export async function getAgendamentosUsuario(usuario_id: string) {
  try {
    const data = await pb.collection('agendamentos').getFullList<Agendamento>({
      filter: `usuario_id = "${usuario_id}"`,
      sort: '-data_agendamento',
      expand: 'slot_id',
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: 'Erro ao carregar agendamentos: ' + getErrorMessage(error) }
  }
}

export async function createAgendamento(payload: unknown) {
  try {
    const validated = agendamentoSchema.parse(payload)
    const data = await pb.collection('agendamentos').create<Agendamento>(validated)
    return { data, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: 'Dados inválidos: ' + error.errors[0].message }
    }
    return { data: null, error: 'Erro ao agendar consulta: ' + getErrorMessage(error) }
  }
}

export async function updateAgendamentoStatus(id: string, status: Agendamento['status']) {
  try {
    const data = await pb.collection('agendamentos').update<Agendamento>(id, { status })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: 'Erro ao atualizar agendamento: ' + getErrorMessage(error) }
  }
}

export async function validarElegibilidade(usuario_id: string, data_desejada: string) {
  try {
    const data = await pb.send('/backend/v1/validar-elegibilidade', {
      method: 'POST',
      body: JSON.stringify({ usuario_id, data_desejada }),
      headers: { 'Content-Type': 'application/json' },
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: 'Erro ao validar elegibilidade: ' + getErrorMessage(error) }
  }
}

export async function getHistoricoElegibilidade(usuario_id: string) {
  try {
    const data = await pb
      .collection('historico_elegibilidade')
      .getFirstListItem<HistoricoElegibilidade>(`usuario_id = "${usuario_id}"`)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: 'Erro ao carregar histórico: ' + getErrorMessage(error) }
  }
}

export async function getSlotById(id: string) {
  try {
    const data = await pb.collection('slots_disponiveis').getOne<SlotDisponivel>(id)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: 'Erro ao carregar slot: ' + getErrorMessage(error) }
  }
}

export async function updateHistoricoElegibilidade(usuario_id: string, data_consulta: string) {
  try {
    let historico: HistoricoElegibilidade | null = null
    try {
      historico = await pb
        .collection('historico_elegibilidade')
        .getFirstListItem<HistoricoElegibilidade>(`usuario_id = "${usuario_id}"`)
    } catch (e) {
      // not found, we will create it
    }

    const dataObj = new Date(data_consulta)
    dataObj.setDate(dataObj.getDate() + 90)
    const proxima = dataObj.toISOString()

    if (historico) {
      await pb.collection('historico_elegibilidade').update(historico.id, {
        ultima_consulta: data_consulta,
        consultas_realizadas_ano: historico.consultas_realizadas_ano + 1,
        proxima_consulta_permitida: proxima,
      })
    } else {
      await pb.collection('historico_elegibilidade').create({
        usuario_id,
        ultima_consulta: data_consulta,
        consultas_realizadas_ano: 1,
        proxima_consulta_permitida: proxima,
      })
    }
    return { error: null }
  } catch (error) {
    return { error: 'Erro ao atualizar histórico: ' + getErrorMessage(error) }
  }
}

export async function confirmarAgendamentoCompleto(payload: AgendamentoPayload, notas?: string) {
  // 1. Criar Agendamento
  const { data: agendamento, error: agError } = await createAgendamento({ ...payload, notas })
  if (agError) return { error: agError }

  // 2. Atualizar Slot
  try {
    await pb.collection('slots_disponiveis').update(payload.slot_id, { agendado: true })
  } catch (error) {
    console.error(
      'Falha ao atualizar o slot (Pode ser bloqueado pelo RLS, fallback necessário):',
      error,
    )
  }

  // 3. Atualizar Histórico de Elegibilidade
  const hError = await updateHistoricoElegibilidade(payload.usuario_id, payload.data_agendamento)
  if (hError.error) {
    console.error('Falha ao atualizar o histórico:', hError.error)
  }

  return { data: agendamento, error: null }
}
