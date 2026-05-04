import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminDashboardMetrics } from '@/services/admin'
import { Link } from 'react-router-dom'
import {
  Users,
  CalendarDays,
  CreditCard,
  Settings as SettingsIcon,
  Bell,
  PlaySquare,
  ArrowRight,
  Activity,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function AdminDashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboardMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in duration-500">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Carregando painel de operações...
        </p>
      </div>
    )
  }

  const quickLinks = [
    {
      title: 'Consultas',
      description: 'Gerenciar agendamentos da clínica',
      icon: CalendarDays,
      href: '/admin/consultas',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-500/10',
    },
    {
      title: 'Pacientes',
      description: 'Diretório completo de usuários',
      icon: Users,
      href: '/admin/usuarios',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/10',
    },
    {
      title: 'Financeiro',
      description: 'Acompanhar pagamentos e assinaturas',
      icon: CreditCard,
      href: '/admin/pagamentos',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-500/10',
    },
    {
      title: 'Conteúdo',
      description: 'Biblioteca de vídeos educativos',
      icon: PlaySquare,
      href: '/admin/videos',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-500/10',
    },
    {
      title: 'Notificações',
      description: 'Centro de envios de mensagens',
      icon: Bell,
      href: '/admin/notificacoes',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-500/10',
    },
    {
      title: 'Configurações',
      description: 'Ajustar horários e limites',
      icon: SettingsIcon,
      href: '/admin/configuracoes',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-200 dark:bg-slate-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 bg-card p-6 md:p-8 rounded-xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10 pointer-events-none" />
        <div className="flex items-center gap-3 text-primary mb-2">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Bem-vindo(a),{' '}
          <span className="font-medium text-foreground">
            {user?.name?.split(' ')[0] || 'Administrador'}
          </span>
          . Acompanhe em tempo real o status das operações.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.todayAppointmentsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Agendadas para o dia atual</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagamentos Pendentes
            </CardTitle>
            <Clock className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.pendingPaymentsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes Ativos
            </CardTitle>
            <Users className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.activePatientsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de contas registradas</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Capacidade Diária
            </CardTitle>
            <Activity className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold leading-none">
                {metrics?.capacityPresencial || 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground pb-0.5 uppercase tracking-wide">
                Presencial
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold leading-none">
                {metrics?.capacityTelemedicina || 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground pb-0.5 uppercase tracking-wide">
                Telemedicina
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold tracking-tight px-1">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Card
                key={link.href}
                className="group overflow-hidden border-border/50 shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Link to={link.href} className="block p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-xl ${link.bgColor} ${link.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1.5 pt-1">
                      <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 mt-2 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
