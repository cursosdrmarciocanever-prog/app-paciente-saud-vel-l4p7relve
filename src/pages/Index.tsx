import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatCards } from '@/components/dashboard/StatCards'
import { WaterTracker } from '@/components/dashboard/WaterTracker'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MOCK_USER } from '@/lib/mock-data'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { LogActivityDialog } from '@/components/dashboard/LogActivityDialog'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Target, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])

  const progressPercent = Math.round(
    ((MOCK_USER.startWeight - MOCK_USER.currentWeight) /
      (MOCK_USER.startWeight - MOCK_USER.goalWeight)) *
      100,
  )

  const loadActivities = async () => {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const records = await pb.collection('physical_activity').getFullList({
        sort: '-date',
        filter: `date >= '${sevenDaysAgo.toISOString()}'`,
      })
      setActivities(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  useRealtime('physical_activity', () => {
    loadActivities()
  })

  // Prepare chart data for last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dayStr = format(d, 'yyyy-MM-dd')
    const dayName = format(d, 'EEE', { locale: ptBR })

    const min = activities
      .filter((a) => a.date.startsWith(dayStr))
      .reduce((sum, a) => sum + a.duration_minutes, 0)

    return { day: dayName, min }
  })

  // Calculate weekly goal progress
  const weeklyGoal = user?.weekly_goal || 3
  const activeDaysCount = chartData.filter((d) => d.min > 0).length
  const goalProgress = Math.min(100, Math.round((activeDaysCount / weeklyGoal) * 100))

  return (
    <div className="space-y-6">
      <Card className="bg-primary overflow-hidden border-none text-primary-foreground relative shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <CardContent className="p-6 md:p-8 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white drop-shadow-sm">
            Olá, {user?.name || MOCK_USER.name}! 👋
          </h2>
          <p className="text-primary-foreground/90 text-sm md:text-base mb-6 max-w-lg font-medium">
            Você já perdeu{' '}
            <strong className="text-white">
              {MOCK_USER.startWeight - MOCK_USER.currentWeight}kg
            </strong>{' '}
            desde o início do programa. Cada pequeno passo te aproxima do seu objetivo. Continue
            firme!
          </p>
          <div className="space-y-2 max-w-md">
            <div className="flex justify-between text-sm font-semibold text-white">
              <span>Progresso Total (Exemplo)</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-black/10 [&>div]:bg-white" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight">Resumo Semanal</h3>
        <div className="flex gap-2">
          {user && <LogActivityDialog userId={user.id} />}
          <Button variant="outline" size="icon" asChild>
            <Link to="/configuracoes">
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm col-span-1 md:col-span-3 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Meta Semanal
            </CardTitle>
            <CardDescription>Dias ativos nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {activeDaysCount} / {weeklyGoal}
              </div>
              <p className="text-muted-foreground text-sm mb-6">Dias de treino</p>
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progresso</span>
                  <span>{goalProgress}%</span>
                </div>
                <Progress value={goalProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2">
          <ActivityChart data={chartData} />
        </div>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTracker />
      </div>
    </div>
  )
}
