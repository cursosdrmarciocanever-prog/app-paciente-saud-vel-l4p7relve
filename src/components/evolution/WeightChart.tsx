import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MOCK_WEIGHT_HISTORY } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'

const chartConfig = {
  weight: {
    label: 'Peso (kg)',
    color: 'hsl(var(--primary))',
  },
}

export function WeightChart() {
  const { toast } = useToast()

  const handleLog = () => {
    toast({ title: 'Em breve', description: 'O registro manual de peso será habilitado em breve.' })
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Histórico de Peso</CardTitle>
          <CardDescription>Acompanhe sua curva de emagrecimento</CardDescription>
        </div>
        <Button size="sm" onClick={handleLog} className="hidden sm:flex">
          <Plus className="w-4 h-4 mr-2" /> Registrar
        </Button>
      </CardHeader>
      <CardContent className="h-[300px] mt-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MOCK_WEIGHT_HISTORY}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="var(--color-weight)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorWeight)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <Button size="sm" onClick={handleLog} className="w-full mt-4 sm:hidden">
          <Plus className="w-4 h-4 mr-2" /> Registrar Peso
        </Button>
      </CardContent>
    </Card>
  )
}
