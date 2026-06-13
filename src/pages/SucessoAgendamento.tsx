import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Video,
  Info,
  Home,
  CalendarPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { Agendamento, agendamentoSchema } from '@/services/agendamentos'
import { z } from 'zod'

export default function SucessoAgendamento() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const idFromQuery = searchParams.get('id')
  const idFromState =
    location.state?.id || location.state?.agendamentoId || location.state?.agendamento?.id
  const agendamentoId = idFromQuery || idFromState

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAgendamento() {
      if (!agendamentoId) {
        // Fallback for preview/mock when directly accessed without params
        setAgendamento({
          id: 'preview',
          usuario_id: '123',
          slot_id: '123',
          data_agendamento: new Date().toISOString(),
          hora_agendamento: '09:00',
          status: 'confirmado',
          tipo_consulta: 'presencial',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      try {
        const record = await pb.collection('agendamentos').getOne(agendamentoId)

        // Validation: Use Zod to validate the appointment data structure
        agendamentoSchema.parse({
          usuario_id: record.usuario_id,
          slot_id: record.slot_id,
          data_agendamento: record.data_agendamento,
          hora_agendamento: record.hora_agendamento,
          status: record.status,
          tipo_consulta: record.tipo_consulta,
          notas: record.notas || '',
        })

        setAgendamento(record as unknown as Agendamento)
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError('A estrutura dos dados do agendamento é inválida.')
        } else {
          setError(
            'Não foi possível carregar os detalhes do agendamento. Ele pode ter sido cancelado ou não existe.',
          )
        }
      } finally {
        setLoading(false)
      }
    }
    loadAgendamento()
  }, [agendamentoId])

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-green-200 dark:bg-green-900/50 rounded-full mb-6"></div>
          <div className="h-8 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !agendamento) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 flex items-center justify-center min-h-[80vh] animate-fade-in-up">
        <Card className="w-full text-center shadow-xl">
          <CardHeader>
            <Info className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Agendamento não encontrado</h1>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'Ocorreu um erro ao carregar os dados.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>
              <Home className="mr-2 w-5 h-5" />
              Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(agendamento.data_agendamento))

  const isPresencial = agendamento.tipo_consulta === 'presencial'
  const localText = isPresencial ? 'Clínica Canever, Maringá - PR' : 'Link enviado por e-mail'

  return (
    <div className="container max-w-lg mx-auto py-16 px-4 flex items-center justify-center animate-fade-in-up min-h-[80vh]">
      <Card className="w-full text-center border-none shadow-2xl bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-background overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <CardHeader className="pt-10 pb-6 relative z-10">
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner animate-slide-down">
            <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Sua consulta foi agendada com sucesso.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          <div className="bg-white dark:bg-muted/30 rounded-xl p-5 text-left border shadow-sm">
            <h3 className="font-semibold text-lg border-b pb-3 mb-4">Resumo da Consulta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
              <div className="flex items-start gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mt-0.5">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    DATA
                  </p>
                  <p className="font-medium text-sm mt-0.5">{dataFormatada}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mt-0.5">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    HORA
                  </p>
                  <p className="font-medium text-sm mt-0.5">{agendamento.hora_agendamento}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mt-0.5">
                  <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    TIPO
                  </p>
                  <p className="font-medium text-sm mt-0.5 capitalize">
                    {agendamento.tipo_consulta}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mt-0.5">
                  {isPresencial ? (
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    LOCAL
                  </p>
                  <p className="font-medium text-sm mt-0.5 leading-tight">{localText}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-left px-1">
            <h3 className="font-semibold text-lg mb-3">Próximos Passos</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-primary/20 rounded-full p-1 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="leading-snug">
                  Você receberá um email de confirmação com os detalhes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-primary/20 rounded-full p-1 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="leading-snug">Chegue 10 minutos antes do horário marcado.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-primary/20 rounded-full p-1 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="leading-snug">Dúvidas? Contate o suporte da clínica.</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-10 relative z-10">
          <Button
            className="w-full h-12 text-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-5 w-5" />
            Voltar ao Dashboard
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12 text-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300"
            onClick={() => navigate('/agendamento')}
          >
            <CalendarPlus className="mr-2 h-5 w-5" />
            Agendar Outra Consulta
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
