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
