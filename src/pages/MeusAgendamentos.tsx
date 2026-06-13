import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAgendamentosUsuario, type Agendamento } from '@/services/agendamentos'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Video, Clock, MapPin, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

export default function MeusAgendamentos() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await getAgendamentosUsuario(user.id)
      if (res.data) {
        setAgendamentos(res.data)
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('agendamentos', () => loadData())

  const now = new Date()

  const proximos = agendamentos
    .filter((a) => {
      const agDate = new Date(`${a.data_agendamento.split('T')[0]}T${a.hora_agendamento}`)
      return agDate >= now && a.status !== 'cancelado'
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.data_agendamento.split('T')[0]}T${a.hora_agendamento}`).getTime()
      const dateB = new Date(`${b.data_agendamento.split('T')[0]}T${b.hora_agendamento}`).getTime()
      return dateA - dateB
    })

  const historico = agendamentos
    .filter((a) => {
      const agDate = new Date(`${a.data_agendamento.split('T')[0]}T${a.hora_agendamento}`)
      return agDate < now || a.status === 'cancelado'
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.data_agendamento.split('T')[0]}T${a.hora_agendamento}`).getTime()
      const dateB = new Date(`${b.data_agendamento.split('T')[0]}T${b.hora_agendamento}`).getTime()
      return dateB - dateA // Sort descending for history
    })

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('T')[0].split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  const renderAgendamentoCard = (agendamento: Agendamento, isPast: boolean) => {
    const isCancelado = agendamento.status === 'cancelado'

    return (
      <Card
        key={agendamento.id}
        className={`shadow-sm border-slate-200 ${isCancelado ? 'opacity-70' : ''}`}
      >
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4 w-full sm:w-auto">
            <div
              className={`p-3 rounded-xl shrink-0 ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}
            >
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  variant={isCancelado ? 'secondary' : isPast ? 'outline' : 'default'}
                  className={
                    !isPast && !isCancelado ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''
                  }
                >
                  {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-white flex items-center gap-1">
                  {agendamento.tipo_consulta === 'telemedicina' ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                  {agendamento.tipo_consulta === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-slate-800 mt-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {formatDate(agendamento.data_agendamento)} às {agendamento.hora_agendamento}
                </div>
              </div>
              {agendamento.notas && (
                <p className="text-sm text-slate-500 mt-2 italic">"{agendamento.notas}"</p>
              )}
            </div>
          </div>

          {!isPast && !isCancelado && agendamento.tipo_consulta === 'telemedicina' && (
            <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              <Video className="w-4 h-4" /> Acessar Sala
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meus Agendamentos</h1>
          <p className="text-slate-500 mt-1">Consulte seu histórico e próximas consultas.</p>
        </div>
        <Button onClick={() => navigate('/agendamento')} className="bg-primary hover:bg-primary/90">
          Nova Consulta <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[120px] w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="proximos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="proximos">Próximas Consultas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="proximos" className="space-y-4 focus-visible:outline-none">
            {proximos.length > 0 ? (
              proximos.map((a) => renderAgendamentoCard(a, false))
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-800">Nenhuma consulta futura</h3>
                <p className="text-slate-500 mt-1 mb-4">
                  Você não tem agendamentos para os próximos dias.
                </p>
                <Button onClick={() => navigate('/agendamento')} variant="outline">
                  Agendar agora
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-4 focus-visible:outline-none">
            {historico.length > 0 ? (
              historico.map((a) => renderAgendamentoCard(a, true))
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-800">Histórico vazio</h3>
                <p className="text-slate-500 mt-1">
                  Você ainda não realizou nenhuma consulta conosco.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
