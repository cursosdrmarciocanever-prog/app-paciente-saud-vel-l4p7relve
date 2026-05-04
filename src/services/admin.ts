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

export const getAdminDashboardMetrics = async () => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const startIso = todayStart.toISOString().replace('T', ' ')
  const endIso = todayEnd.toISOString().replace('T', ' ')

  const [todayAppointments, pendingPayments, activePatients, settingsList] = await Promise.all([
    pb.collection('appointments').getList(1, 1, {
      filter: `status = "agendado" && date >= "${startIso}" && date <= "${endIso}"`,
    }),
    pb.collection('payments').getList(1, 1, {
      filter: `status = "pendente"`,
    }),
    pb.collection('users').getList(1, 1, {
      filter: `role = "paciente"`,
    }),
    pb.collection('settings').getList(1, 1),
  ])

  const settings = settingsList.items[0] || { max_daily_presencial: 0, max_daily_telemedicina: 0 }

  return {
    todayAppointmentsCount: todayAppointments.totalItems,
    pendingPaymentsCount: pendingPayments.totalItems,
    activePatientsCount: activePatients.totalItems,
    capacityPresencial: settings.max_daily_presencial,
    capacityTelemedicina: settings.max_daily_telemedicina,
  }
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
