import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarDays,
  CreditCard,
  Activity,
  ArrowRight,
  TrendingDown,
  BookOpen,
  ImageIcon,
  Dumbbell,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any | null>(null)
  const [nextAppointment, setNextAppointment] = useState<any | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        const [subRes, apptRes, actsRes] = await Promise.all([
          pb
            .collection('subscriptions')
            .getList(1, 1, {
              filter: `user = '${user.id}' && status != 'canceled'`,
              sort: '-created',
            })
            .catch(() => ({ items: [] })),
          pb
            .collection('appointments')
            .getList(1, 1, {
              filter: `user = '${user.id}' && date >= '${new Date().toISOString()}' && status != 'cancelado'`,
              sort: 'date',
            })
            .catch(() => ({ items: [] })),
          pb
            .collection('physical_activity')
            .getList(1, 3, {
              filter: `user = '${user.id}'`,
              sort: '-date',
            })
            .catch(() => ({ items: [] })),
        ])

        setSubscription(subRes.items[0] || null)
        setNextAppointment(apptRes.items[0] || null)
        setRecentActivities(actsRes.items || [])
      } catch (err) {
        console.error('Error loading dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const planNames: Record<string, string> = {
    entry: 'Entry',
    intermediate: 'Intermediário',
    premium: 'Premium',
    diamond: 'Diamond',
  }

  const statusNames: Record<string, string> = {
    active: 'Ativo',
    pending_payment: 'Pagamento Pendente',
    canceled: 'Cancelado',
    suspended: 'Suspenso',
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in duration-500">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Carregando seu painel...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <Card className="bg-primary overflow-hidden border-none text-primary-foreground relative shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <CardContent className="p-6 md:p-8 relative z-10 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white drop-shadow-sm">
            Olá, {user?.name?.split(' ')[0] || 'Paciente'}! 👋
          </h2>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-lg font-medium leading-relaxed">
            Bem-vindo ao seu painel da Clínica Canever. Acompanhe sua saúde, gerencie seus
            agendamentos e acesse conteúdos exclusivos.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Status */}
        <Card className="border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Minha Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {subscription ? (
              <div className="p-5 border rounded-xl bg-primary/5 flex flex-col gap-3 flex-1 justify-center">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-foreground uppercase tracking-wider text-sm">
                    Plano {planNames[subscription.plan] || subscription.plan}
                  </p>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {statusNames[subscription.status] || subscription.status}
                  </span>
                </div>
                {subscription.renewal_date && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Renovação:{' '}
                    <span className="font-medium text-foreground">
                      {format(parseISO(subscription.renewal_date), "dd 'de' MMM, yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </p>
                )}
                <div className="mt-auto pt-2">
                  <Button
                    variant="link"
                    className="p-0 h-auto justify-start text-primary font-semibold"
                    asChild
                  >
                    <Link to="/planos">
                      Gerenciar assinatura <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 border rounded-xl bg-muted/30 text-center flex flex-col items-center justify-center gap-4 flex-1">
                <p className="text-muted-foreground font-medium text-sm">
                  Você ainda não possui uma assinatura ativa.
                </p>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link to="/planos">Ver Planos Disponíveis</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Appointment */}
        <Card className="border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Próxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {nextAppointment ? (
              <div className="p-5 border rounded-xl bg-primary/5 flex flex-col gap-2 flex-1 justify-center relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10" />
                <p className="font-bold text-foreground text-lg z-10">{nextAppointment.title}</p>
                <p className="text-sm text-muted-foreground z-10 flex flex-col gap-1">
                  <span className="font-medium text-foreground">
                    {format(parseISO(nextAppointment.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  <span>
                    às {format(parseISO(nextAppointment.date), 'HH:mm', { locale: ptBR })}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1 z-10">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-background border rounded-md text-muted-foreground capitalize">
                    {nextAppointment.type || 'Presencial'}
                  </span>
                </div>
                <div className="mt-auto pt-2 z-10">
                  <Button
                    variant="link"
                    className="p-0 h-auto justify-start text-primary font-semibold"
                    asChild
                  >
                    <Link to="/consultas">
                      Ver detalhes <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 border rounded-xl bg-muted/30 text-center flex flex-col items-center justify-center gap-4 flex-1">
                <p className="text-muted-foreground font-medium text-sm">
                  Nenhuma consulta futura agendada.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link to="/consultas">Agendar Consulta</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <Card className="border-border/50 shadow-sm h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Acesso Rápido</CardTitle>
            <CardDescription>Gerencie seu progresso e acesse conteúdos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-3 justify-center hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                asChild
              >
                <Link to="/evolucao">
                  <TrendingDown className="w-6 h-6" />
                  <span className="font-semibold text-sm">Evolução</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-3 justify-center hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                asChild
              >
                <Link to="/bioimpedancia">
                  <Activity className="w-6 h-6" />
                  <span className="font-semibold text-sm">Bioimpedância</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-3 justify-center hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                asChild
              >
                <Link to="/fotos">
                  <ImageIcon className="w-6 h-6" />
                  <span className="font-semibold text-sm">Fotos</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-3 justify-center hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                asChild
              >
                <Link to="/biblioteca">
                  <BookOpen className="w-6 h-6" />
                  <span className="font-semibold text-sm">Biblioteca</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-border/50 shadow-sm h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                Atividades Recentes
              </CardTitle>
            </div>
            <CardDescription>Seus últimos registros de treino</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {recentActivities.length > 0 ? (
              <div className="space-y-3 flex-1 flex flex-col">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center p-3.5 border rounded-xl bg-card hover:bg-muted/50 transition-colors shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {activity.activity_type || 'Atividade Física'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(parseISO(activity.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                      {activity.duration_minutes} min
                    </div>
                  </div>
                ))}
                <div className="mt-auto pt-4">
                  <Button
                    variant="ghost"
                    className="w-full text-sm font-medium text-muted-foreground hover:text-primary"
                    asChild
                  >
                    <Link to="/evolucao">Ver todo o histórico</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 border rounded-xl bg-muted/30 text-center flex flex-col items-center justify-center h-full gap-4 min-h-[180px]">
                <p className="text-muted-foreground font-medium text-sm">
                  Nenhuma atividade registrada recentemente.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/evolucao">Registrar Atividade</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
