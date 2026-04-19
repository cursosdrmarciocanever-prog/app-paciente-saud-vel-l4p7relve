import { StatCards } from '@/components/dashboard/StatCards'
import { WaterTracker } from '@/components/dashboard/WaterTracker'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MOCK_USER } from '@/lib/mock-data'

export default function Dashboard() {
  const progressPercent = Math.round(
    ((MOCK_USER.startWeight - MOCK_USER.currentWeight) /
      (MOCK_USER.startWeight - MOCK_USER.goalWeight)) *
      100,
  )

  return (
    <div className="space-y-6">
      <Card className="bg-primary overflow-hidden border-none text-primary-foreground relative shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <CardContent className="p-6 md:p-8 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white drop-shadow-sm">
            Olá, {MOCK_USER.name}! 👋
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
              <span>Progresso Total</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-black/10 [&>div]:bg-white" />
          </div>
        </CardContent>
      </Card>

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTracker />
        <ActivityChart />
      </div>
    </div>
  )
}
