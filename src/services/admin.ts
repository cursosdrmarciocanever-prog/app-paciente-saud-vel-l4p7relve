import pb from '@/lib/pocketbase/client'

export const getAdminStats = async () => {
  const [users, subs, payments] = await Promise.all([
    pb.collection('users').getFullList({ filter: 'role != "admin"' }),
    pb.collection('subscriptions').getFullList(),
    pb.collection('payments').getFullList({ filter: 'status = "aprovado"' }),
  ])

  const totalUsers = users.length
  const activeSubs = subs.filter((s) => s.status === 'active').length
  const canceledSubs = subs.filter((s) => s.status === 'canceled').length
  const churnRate = totalUsers > 0 ? ((canceledSubs / totalUsers) * 100).toFixed(2) : '0.00'

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = payments
    .filter((p) => {
      const d = new Date(p.created)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((acc, p) => acc + p.amount, 0)

  return { totalUsers, activeSubs, monthlyRevenue, churnRate, users, subs, payments }
}

export const getSubscriptions = () =>
  pb.collection('subscriptions').getFullList({ sort: '-created', expand: 'user' })

export const updateSubscription = (id: string, data: any) =>
  pb.collection('subscriptions').update(id, data)

export const cancelSubscription = (id: string) =>
  pb.collection('subscriptions').update(id, { status: 'canceled' })

export const getAppointmentsAdmin = () =>
  pb.collection('appointments').getFullList({ sort: '-date', expand: 'user' })

export const cancelAppointment = (id: string) =>
  pb.collection('appointments').update(id, { status: 'cancelado' })

export const getPayments = () =>
  pb.collection('payments').getFullList({ sort: '-created', expand: 'user' })

export const refundPayment = (id: string) =>
  pb.collection('payments').update(id, { status: 'reembolsado' })

export const getNotificationsAdmin = () =>
  pb.collection('notifications').getFullList({ sort: '-created', expand: 'user' })

export const sendNotification = (data: any) => pb.collection('notifications').create(data)
