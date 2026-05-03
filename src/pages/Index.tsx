import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatCards } from '@/components/dashboard/StatCards'
import { WaterTracker } from '@/components/dashboard/WaterTracker'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { Progress } from '@/components/ui/progress'
import { MOCK_USER } from '@/lib/mock-data'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { LogActivityDialog } from '@/components/dashboard/LogActivityDialog'
import { LogBioimpedanceDialog } from '@/components/dashboard/LogBioimpedanceDialog'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Target, Settings as SettingsIcon, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [stats, setStats] = useState({ streak: 0, total: 0 })

  const progressPercent = Math.round(
    ((MOCK_USER.startWeight - MOCK_USER.currentWeight) /
      (MOCK_USER.startWeight - MOCK_USER.goalWeight)) *
      100,
  )

  const loadBadges = async () => {
    try {
      const allBadges = await pb.collection('badges').getFullList({ sort: 'requirement_value' })
      const earned = await pb
        .collection('user_badges')
        .getFullList({ filter: `user = '${user?.id}'`, expand: 'badge' })
      setBadges(allBadges)
      setUserBadges(earned)
    } catch (e) {
      console.error(e)
    }
  }

  const loadActivities = async () => {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentRecords = await pb.collection('physical_activity').getFullList({
        sort: '-date',
        filter: `date >= '${sevenDaysAgo.toISOString()}'`,
      })
      setActivities(recentRecords)

      const allActs = await pb.collection('physical_activity').getFullList({
        filter: `user = '${user?.id}'`,
        sort: '-date',
      })

      const dailyGoal = user?.daily_goal_minutes || 30
      const activeDates: string[] = []
      allActs.forEach((a) => {
        if (a.duration_minutes >= dailyGoal) {
          const d = a.date.split(' ')[0]
          if (!activeDates.includes(d)) activeDates.push(d)
        }
      })

      activeDates.sort((a, b) => b.localeCompare(a))

      let currentStreak = 0
      if (activeDates.length > 0) {
        const parseDateStr = (str: string) => {
          const parts = str.split('-')
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        }

        let lastDate = parseDateStr(activeDates[0])
        let today = new Date()
        today.setHours(0, 0, 0, 0)

        let diffTime = Math.abs(today.getTime() - lastDate.getTime())
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 1) {
          currentStreak = 1
          for (let i = 1; i < activeDates.length; i++) {
            let curr = parseDateStr(activeDates[i])
            let prev = parseDateStr(activeDates[i - 1])
            let d = Math.round(Math.abs(prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
            if (d === 1) {
              currentStreak++
            } else {
              break
            }
          }
        }
      }

      setStats({
        streak: currentStreak,
        total: activeDates.length,
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadActivities()
      loadBadges()
    }
  }, [user?.id])

  useRealtime('physical_activity', () => {
    loadActivities()
  })

  useRealtime('user_badges', (e) => {
    if (e.action === 'create') {
      const badgeId = e.record.badge
      const b = badges.find((x) => x.id === badgeId)
      if (b) {
        toast.success(`Parabéns! Você desbloqueou a conquista: ${b.name}! 🏆`, {
          duration: 6000,
        })
      }
      loadBadges()
    }
  })

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dayStr = format(d, 'yyyy-MM-dd')
    const dayName = format(d, 'EEE', { locale: ptBR })

    const min = activities
      .filter((a) => a.date.startsWith(dayStr))
      .reduce((sum, a) => sum + a.duration_minutes, 0)

    return { day: dayName, min }
  })

  const weeklyGoal = user?.weekly_goal || 3
  const activeDaysCount = chartData.filter((d) => d.min > 0).length
  const goalProgress = Math.min(100, Math.round((activeDaysCount / weeklyGoal) * 100))

  const nextBadge = badges
    .filter((b) => !userBadges.some((ub) => ub.badge === b.id))
    .sort((a, b) => a.requirement_value - b.requirement_value)[0]

  let progressText = 'Continue assim para novas conquistas!'
  if (nextBadge) {
    if (nextBadge.type === 'streak_days') {
      const remaining = nextBadge.requirement_value - stats.streak
      progressText = `Faltam ${remaining} dias na ofensiva para a conquista '${nextBadge.name}'!`
    } else if (nextBadge.type === 'first_log') {
      progressText = `Registre sua primeira atividade para ganhar '${nextBadge.name}'!`
    } else if (nextBadge.type === 'weekly_goals_met') {
      progressText = `Bata sua meta semanal para ganhar '${nextBadge.name}'!`
    } else {
      const remaining = nextBadge.requirement_value - stats.total
      progressText = `Faltam ${remaining} treinos para a conquista '${nextBadge.name}'!`
    }
  }

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
          {user && <LogBioimpedanceDialog />}
          {user && <LogActivityDialog userId={user.id} />}
          <Button variant="outline" size="icon" asChild>
            <Link to="/configuracoes">
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {badges.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Minhas Conquistas
              </CardTitle>
              {nextBadge && (
                <div className="hidden md:flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {progressText}
                </div>
              )}
            </div>
            <CardDescription>
              Suas medalhas e marcos alcançados baseados em suas atividades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextBadge && (
              <div className="md:hidden flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full mb-4 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{progressText}</span>
              </div>
            )}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x scrollbar-hide">
              {badges.map((badge) => {
                const earned = userBadges.find((ub) => ub.badge === badge.id)
                const isEarned = !!earned

                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex flex-col items-center justify-center p-4 rounded-xl min-w-[130px] transition-all snap-start',
                          isEarned
                            ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-white border border-amber-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1'
                            : 'bg-gray-50/80 border border-gray-100 opacity-60 grayscale cursor-not-allowed',
                        )}
                      >
                        <div
                          className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors',
                            isEarned
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-inner shadow-amber-900/20'
                              : 'bg-gray-200 text-gray-400',
                          )}
                        >
                          <Trophy className="w-7 h-7 drop-shadow-sm" />
                        </div>
                        <span
                          className={cn(
                            'text-[13px] font-bold text-center leading-tight px-1',
                            isEarned ? 'text-amber-900' : 'text-gray-500',
                          )}
                        >
                          {badge.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-center p-3 z-50">
                      <p className="font-bold text-base mb-1">{badge.name}</p>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      {isEarned && earned.earned_at && (
                        <p className="text-xs text-amber-600 mt-2 font-semibold">
                          Alcançado em: {format(new Date(earned.earned_at), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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

      <SummaryCards />

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTracker />
      </div>
    </div>
  )
}
