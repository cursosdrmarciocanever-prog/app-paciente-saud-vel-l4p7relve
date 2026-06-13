import pb from '@/lib/pocketbase/client'
import { subMonths, subWeeks, startOfWeek, format, isAfter, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface DashboardData {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  occupancyRate: number
  appointmentsByMonth: { month: string; count: number }[]
  weeklyOccupancy: { week: string; rate: number }[]
  revenuePieData: { name: string; value: number; fill: string }[]
}

export async function getDashboardData(): Promise<DashboardData> {
  // 1. Total Users
  const usersList = await pb.collection('users').getList(1, 1)
  const totalUsers = usersList.totalItems

  // 2. Assinaturas & Revenue
  const assinaturas = await pb.collection('assinaturas').getFullList({
    filter: 'status = "ativo" || status = "active"',
  })

  const activeSubscriptions = assinaturas.length

  let monthlyRevenue = 0
  const revenueByPlan: Record<string, number> = {}

  assinaturas.forEach((sub) => {
    const planName = (sub.plano || 'Entry').toLowerCase()
    let price = 99
    if (planName.includes('entry')) price = 99
    else if (planName.includes('inter')) price = 199
    else if (planName.includes('premium')) price = 299
    else if (planName.includes('diamond')) price = 399

    monthlyRevenue += price

    const label = planName.charAt(0).toUpperCase() + planName.slice(1)
    revenueByPlan[label] = (revenueByPlan[label] || 0) + price
  })

  // 3. Occupancy Rate (Global)
  const totalSlotsList = await pb.collection('slots_disponiveis').getList(1, 1)
  const totalAllSlots = totalSlotsList.totalItems

  const agendadosList = await pb
    .collection('slots_disponiveis')
    .getList(1, 1, { filter: 'agendado = true' })
  const allAgendados = agendadosList.totalItems

  const occupancyRate = totalAllSlots > 0 ? (allAgendados / totalAllSlots) * 100 : 0

  // 4. Appointments over time (last 12 months)
  const now = new Date()
  const twelveMonthsAgo = subMonths(now, 12)
  const agendamentos = await pb.collection('agendamentos').getFullList({
    filter: `data_agendamento >= "${twelveMonthsAgo.toISOString().split('T')[0]}"`,
  })

  const appointmentsByMonth = Array.from({ length: 12 }).map((_, i) => {
    const d = subMonths(now, 11 - i)
    return {
      month: format(d, 'MMM/yy', { locale: ptBR }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      count: 0,
    }
  })

  agendamentos.forEach((a) => {
    const d = parseISO(a.data_agendamento)
    const item = appointmentsByMonth.find(
      (m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear(),
    )
    if (item) {
      item.count++
    }
  })

  // 5. Weekly Slots (Last 8 weeks)
  const eightWeeksAgo = subWeeks(now, 8)

  const slots = await pb.collection('slots_disponiveis').getFullList({
    filter: `data >= "${eightWeeksAgo.toISOString().split('T')[0]} 00:00:00.000Z"`,
  })

  const slotsByWeek = Array.from({ length: 8 }).map((_, i) => {
    const d = subWeeks(now, 7 - i)
    return {
      weekStart: startOfWeek(d, { weekStartsOn: 1 }),
      label: format(d, 'dd/MM', { locale: ptBR }),
      total: 0,
      agendado: 0,
    }
  })

  slots.forEach((s) => {
    const d = parseISO(s.data)
    for (let i = slotsByWeek.length - 1; i >= 0; i--) {
      if (!isAfter(slotsByWeek[i].weekStart, d)) {
        slotsByWeek[i].total++
        if (s.agendado) slotsByWeek[i].agendado++
        break
      }
    }
  })

  const weeklyOccupancy = slotsByWeek.map((w) => ({
    week: w.label,
    rate: w.total > 0 ? Math.round((w.agendado / w.total) * 100) : 0,
  }))

  const chartColors = ['#eab308', '#10b981', '#64748b', '#3b82f6', '#8b5cf6']
  const revenuePieData = Object.keys(revenueByPlan).map((k, i) => ({
    name: k,
    value: revenueByPlan[k],
    fill: chartColors[i % chartColors.length],
  }))

  return {
    totalUsers,
    activeSubscriptions,
    monthlyRevenue,
    occupancyRate: Math.round(occupancyRate),
    appointmentsByMonth: appointmentsByMonth.map((m) => ({ month: m.month, count: m.count })),
    weeklyOccupancy,
    revenuePieData,
  }
}
