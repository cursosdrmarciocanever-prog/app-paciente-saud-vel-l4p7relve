import pb from '@/lib/pocketbase/client'

export interface AppointmentRecord {
  id: string
  title: string
  date: string
  status: string
  notes: string
}

export const getAppointments = () =>
  pb.collection('appointments').getFullList<AppointmentRecord>({ sort: '-date' })

export const createAppointment = (data: Partial<AppointmentRecord>) =>
  pb.collection('appointments').create(data)

export const updateAppointment = (id: string, data: Partial<AppointmentRecord>) =>
  pb.collection('appointments').update(id, data)
