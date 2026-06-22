import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAssinaturas, type Assinatura } from '@/services/assinaturas'
import { getAgendamentosUsuario, type Agendamento } from '@/services/agendamentos'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Calendar,
  Video,
  BookOpen,
  CreditCard,
  Lock,
  ArrowRight,
  Loader2,
  MessageSquare,
  Dumbbell,
  Syringe,
  ChevronDown,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { CatalogoTable } from '@/components/dashboard/CatalogoTable'
import { WaterTrackerCard } from '@/components/dashboard/WaterTrackerCard'
import { AppleHealthCard } from '@/components/dashboard/AppleHealthCard'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [catalogoAberto, setCatalogoAberto] = useState(false)
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null)
  const [proximaConsulta, setProximaConsulta] = useState<Agendamento | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [assinaturaData, agendamentosRes] = await Promise.all([
        getAssinaturas(),
        getAgendamentosUsuario(user.id),
      ])

      if (assinaturaData.length > 0) {
        setAssinatura(assinaturaData[0])
      } else {
        setAssinatura(null)
      }

      if (agendamentosRes.data) {
        const now = new Date()
        const futuros = agendamentosRes.data
          .filter((a) => {
            if (a.status === 'cancelado') return false
            const agDate = new Date(`${a.data_agendamento.split('T')[0]}T${a.hora_agendamento}`)
            return agDate >= now
          })
          .sort((a, b) => {
            const dateA = new Date(
              `${a.data_agendamento.split('T')[0]}T${a.hora_agendamento}`,
            ).getTime()
            const dateB = new Date(
              `${b.data_agendamento.split('T')[0]}T${b.hora_agendamento}`,
            ).getTime()
            return dateA - dateB
          })

        setProximaConsulta(futuros.length > 0 ? futuros[0] : null)
      }
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('assinaturas', () => loadData())
  useRealtime('agendamentos', () => loadData())

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      // Aceita tanto "2026-07-13T12:00:00Z" quanto "2026-07-13 12:00:00.000Z"
      const datePart = dateString.split('T')[0].split(' ')[0]
      const [year, month, day] = datePart.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  const hasActiveSub =
    assinatura?.status === 'ativo' ||
    assinatura?.status === 'active' ||
    assinatura?.status === 'ativa'

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[250px] rounded-xl" />
          <Skeleton className="h-[250px] rounded-xl" />
          <Skeleton className="h-[250px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Olá, {user?.name || user?.email?.split('@')[0] || 'Paciente'}!
        </h1>
        <p className="text-slate-500 mt-1">
          Bem-vindo ao seu painel de controle. Aqui está o resumo da sua saúde.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card: Próxima Consulta */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Próxima Consulta</CardTitle>
            </div>
            <CardDescription>Acompanhe seus agendamentos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {proximaConsulta ? (
              <div className="p-4 bg-secondary rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background">
                    {proximaConsulta.tipo_consulta === 'telemedicina'
                      ? 'Telemedicina'
                      : 'Presencial'}
                  </Badge>
                  <span className="text-sm font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                    Confirmado
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">
                    {formatDate(proximaConsulta.data_agendamento)}
                  </p>
                  <p className="text-muted-foreground">às {proximaConsulta.hora_agendamento}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-secondary rounded-xl border border-border border-dashed h-full">
                <Calendar className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">Nenhuma consulta marcada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agende um horário para ser atendido.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              className="w-full"
              variant={proximaConsulta ? 'outline' : 'default'}
              onClick={() => navigate(hasActiveSub ? '/agendamento' : '/assinaturas')}
            >
              {proximaConsulta ? 'Ver Detalhes' : 'Agendar Agora'}
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Biblioteca */}
        <Card className="flex flex-col h-full relative overflow-hidden">
          {!hasActiveSub && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-3 bg-background shadow-sm border border-border rounded-full mb-3">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Acesso Restrito</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assine um de nossos planos para acessar a biblioteca completa.
              </p>
              <Button onClick={() => navigate('/assinaturas')} size="sm">
                Ver Planos
              </Button>
            </div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Biblioteca de Saúde</CardTitle>
            </div>
            <CardDescription>Artigos e vídeos exclusivos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Explore nosso acervo de conteúdos criados por especialistas para melhorar sua
                qualidade de vida.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowRight className="w-4 h-4 text-primary" /> Artigos médicos
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowRight className="w-4 h-4 text-primary" /> Vídeos de orientação
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowRight className="w-4 h-4 text-primary" /> Dicas de bem-estar
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              className="w-full"
              onClick={() => navigate('/biblioteca')}
              disabled={!hasActiveSub}
            >
              Acessar Biblioteca
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Assinatura */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Sua Assinatura</CardTitle>
            </div>
            <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {assinatura ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Plano Atual</span>
                  <span className="font-semibold text-foreground">
                    {assinatura.plano || 'Padrão'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge
                    variant={hasActiveSub ? 'default' : 'destructive'}
                    className={
                      hasActiveSub
                        ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border-0'
                        : 'border-0'
                    }
                  >
                    {assinatura.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                {assinatura.data_renovacao && hasActiveSub && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Renovação</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(assinatura.data_renovacao)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-secondary rounded-xl border border-border h-full">
                <p className="text-sm font-medium text-foreground">Sem plano ativo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Assine para ter acesso a consultas e à biblioteca.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full" variant="outline" onClick={() => navigate('/assinaturas')}>
              {assinatura ? 'Gerenciar Assinatura' : 'Ver Planos'}
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Suporte */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Suporte Integrado</CardTitle>
            </div>
            <CardDescription>Fale com nosso assistente</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dúvidas? Nosso assistente inteligente está disponível para lhe ajudar com qualquer
                questão.
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2 mt-auto">
            <Button className="w-full" onClick={() => navigate('/suporte/chat')} variant="outline">
              Acessar Suporte
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WaterTrackerCard />
        <AppleHealthCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 flex flex-col justify-center">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" /> Acompanhe seus hábitos
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Registre atividades físicas e refeições e desbloqueie conquistas.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={() => navigate('/atividades')}>
                Atividades
              </Button>
              <Button variant="outline" onClick={() => navigate('/alimentacao')}>
                Diário
              </Button>
              <Button variant="outline" onClick={() => navigate('/conquistas')}>
                Conquistas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <button
          onClick={() => setCatalogoAberto((v) => !v)}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-sm hover:bg-secondary/30 transition-colors"
        >
          <span className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Syringe className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block font-semibold text-foreground">
                Catálogo completo de injetáveis
              </span>
              <span className="block text-xs text-muted-foreground">
                Toque para ver a tabela com funções e valores
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              catalogoAberto ? 'rotate-180' : ''
            }`}
          />
        </button>
        {catalogoAberto && (
          <div className="mt-2">
            <CatalogoTable hideHeader />
          </div>
        )}
      </div>
    </div>
  )
}
