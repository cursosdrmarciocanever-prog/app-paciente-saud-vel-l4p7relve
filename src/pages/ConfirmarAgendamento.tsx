import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Video, User, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getSlotById,
  validarElegibilidade,
  confirmarAgendamentoCompleto,
  type SlotDisponivel,
} from '@/services/agendamentos'

export default function ConfirmarAgendamento() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const slotId = searchParams.get('slotId')

  const [slot, setSlot] = useState<SlotDisponivel | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (!slotId) {
      navigate('/agendamento')
      return
    }

    async function fetchSlot() {
      const { data, error } = await getSlotById(slotId!)
      if (error || !data) {
        navigate('/agendamento')
        return
      }
      setSlot(data)
      setPageLoading(false)
    }

    fetchSlot()
  }, [slotId, navigate])

  const handleConfirm = async () => {
    if (!slot || !user) return

    setSubmitting(true)
    setError(null)

    // 1. Validar Elegibilidade
    const { error: valError } = await validarElegibilidade(user.id, slot.data)
    if (valError) {
      setError(valError)
      setSubmitting(false)
      return
    }

    // 2. Montar Payload e Confirmar Fluxo (Criar Agendamento, Atualizar Slot, Atualizar Histórico)
    const payload = {
      usuario_id: user.id,
      slot_id: slot.id,
      data_agendamento: slot.data,
      hora_agendamento: slot.hora_inicio,
      status: 'confirmado' as const,
      tipo_consulta: slot.tipo || 'presencial',
      notas,
    }

    const { error: confError } = await confirmarAgendamentoCompleto(payload, notas)

    if (confError) {
      setError(confError)
      setSubmitting(false)
      return
    }

    // Sucesso - redirecionar
    navigate('/agendamento/sucesso')
  }

  if (pageLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-10 px-4">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (!slot) return null

  const formattedDate = format(parseISO(slot.data), "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 animate-fade-in-up">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-2xl font-bold text-center">Resumo do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na confirmação</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 mt-2">
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfirm}
                  className="w-fit border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tentar Novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2 bg-muted/20 p-4 rounded-lg border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Data</p>
                <p className="text-sm">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Horário</p>
                <p className="text-sm">
                  {slot.hora_inicio} - {slot.hora_fim}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {slot.tipo === 'telemedicina' ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Tipo</p>
                <p className="text-sm capitalize">{slot.tipo || 'Presencial'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Médico</p>
                <p className="text-sm">Dr. Márcio Canever</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notas" className="text-base font-semibold">
              Descreva seus sintomas ou dúvidas (Opcional)
            </Label>
            <Textarea
              id="notas"
              placeholder="Ex: Tenho sentido dores de cabeça frequentes..."
              className="min-h-[120px] resize-none focus-visible:ring-primary/50"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={submitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t bg-muted/10 pt-6">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Voltar
          </Button>
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar Agendamento'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
