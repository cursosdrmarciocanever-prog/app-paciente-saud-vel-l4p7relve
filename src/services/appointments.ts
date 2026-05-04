import pb from '@/lib/pocketbase/client'

export interface AppointmentRecord {
  id: string
  user: string
  title: string
  date: string
  type: 'presencial' | 'telemedicina'
  status: 'agendado' | 'concluido' | 'cancelado'
  notes?: string
  subscription?: string
}

export const getAppointments = () =>
  pb.collection('appointments').getFullList<AppointmentRecord>({ sort: '-date' })

export const createAppointment = (data: Partial<AppointmentRecord>) =>
  pb.collection('appointments').create(data)

export const updateAppointment = (id: string, data: Partial<AppointmentRecord>) =>
  pb.collection('appointments').update(id, data)

export const checkDailyCapacity = async (dateStr: string, type: 'presencial' | 'telemedicina') => {
  try {
    const records = await pb.collection('appointments').getList(1, 1, {
      filter: `date ~ "${dateStr}" && type = "${type}" && status != "cancelado"`,
      requestKey: null,
    })
    return records.totalItems
  } catch (e) {
    console.error(e)
    return 0
  }
}

export const getOccupiedSlots = async (start: string, end: string): Promise<string[]> => {
  try {
    return await pb.send('/backend/v1/appointments/occupied', {
      method: 'GET',
      params: { start, end },
    })
  } catch (e) {
    console.error(e)
    return []
  }
}
