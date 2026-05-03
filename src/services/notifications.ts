import pb from '@/lib/pocketbase/client'

export interface NotificationRecord {
  id: string
  title: string
  message: string
  is_read: boolean
  created: string
}

export const getNotifications = () => {
  if (!pb.authStore.model?.id) return Promise.resolve([])
  return pb.collection('notifications').getFullList<NotificationRecord>({
    filter: `user = '${pb.authStore.model.id}'`,
    sort: '-created',
  })
}

export const markNotificationRead = (id: string) =>
  pb.collection('notifications').update(id, { is_read: true })
