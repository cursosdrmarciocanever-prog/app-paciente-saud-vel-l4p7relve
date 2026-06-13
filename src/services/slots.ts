import pb from '@/lib/pocketbase/client'

export interface Slot {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: 'presencial' | 'telemedicina'
  agendado: boolean
  medico_id: string
  created: string
  updated: string
}

export const getAvailableSlots = async (from?: Date) => {
  let filter = `agendado = false`
  if (from) {
    const fromStr = from.toISOString().split('T')[0]
    filter += ` && data >= "${fromStr} 00:00:00.000Z"`
  }
  return pb.collection('slots_disponiveis').getFullList<Slot>({
    filter,
    sort: 'data,hora_inicio',
  })
}

export const getSlots = async (medico_id: string, from?: Date, to?: Date) => {
  let filter = `medico_id = "${medico_id}"`
  if (from) {
    const fromStr = from.toISOString().split('T')[0]
    filter += ` && data >= "${fromStr} 00:00:00.000Z"`
  }
  if (to) {
    const toStr = to.toISOString().split('T')[0]
    filter += ` && data <= "${toStr} 23:59:59.999Z"`
  }
  return pb.collection('slots_disponiveis').getFullList<Slot>({
    filter,
    sort: 'data,hora_inicio',
  })
}

export const createSlot = async (data: Partial<Slot>) => {
  return pb.collection('slots_disponiveis').create<Slot>(data)
}

export const updateSlot = async (id: string, data: Partial<Slot>) => {
  return pb.collection('slots_disponiveis').update<Slot>(id, data)
}

export const deleteSlot = async (id: string) => {
  return pb.collection('slots_disponiveis').delete(id)
}
