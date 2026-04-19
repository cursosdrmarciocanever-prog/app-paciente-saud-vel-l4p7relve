import { Card, CardContent } from '@/components/ui/card'
import { TrendingDown, Activity, CalendarDays, Target } from 'lucide-react'
import { MOCK_USER } from '@/lib/mock-data'

export function StatCards() {
  const stats = [
    {
      title: 'Peso Atual',
      value: `${MOCK_USER.currentWeight} kg`,
      desc: `- ${MOCK_USER.startWeight - MOCK_USER.currentWeight}kg desde o início`,
      icon: TrendingDown,
      color: 'text-primary',
      bg: 'bg-primary/15',
    },
    {
      title: 'IMC Atual',
      value: MOCK_USER.bmi.toString(),
      desc: 'Sobrepeso leve',
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary/15',
    },
    {
      title: 'Dias no Programa',
      value: MOCK_USER.daysInProgram.toString(),
      desc: 'Foco e consistência!',
      icon: CalendarDays,
      color: 'text-primary',
      bg: 'bg-primary/15',
    },
    {
      title: 'Próxima Meta',
      value: '70 kg',
      desc: `Faltam ${MOCK_USER.currentWeight - 70}kg`,
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/15',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="tracking-tight text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2 md:mt-4">
              <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
