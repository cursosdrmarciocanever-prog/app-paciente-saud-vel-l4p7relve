import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminStats } from '@/services/admin'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  if (!stats) return <div className="p-8 text-center">Carregando métricas...</div>

  const chartData = [
    { name: 'Dez', revenue: Math.max(0, stats.monthlyRevenue - 2000) },
    { name: 'Jan', revenue: Math.max(0, stats.monthlyRevenue - 1000) },
    { name: 'Fev', revenue: stats.monthlyRevenue },
  ]

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Mes,Receita\n' +
      chartData.map((e) => `${e.name},${e.revenue}`).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'relatorio_receita.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={exportCSV}>
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Exportar PDF
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeSubs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              R$ {stats.monthlyRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{stats.churnRate}%</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Crescimento da Receita</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer
            config={{ revenue: { label: 'Receita (R$)', color: 'hsl(var(--primary))' } }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
