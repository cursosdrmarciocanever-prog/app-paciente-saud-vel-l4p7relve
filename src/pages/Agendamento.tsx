import { useState, useEffect, useMemo } from 'react'
import { format, addMonths, startOfDay, isSameDay, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { getSlotsDisponiveis, validarElegibilidade, SlotDisponivel } from '@/services/agendamentos'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar as CalendarIcon, Clock, Stethoscope, Video } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const elegibilidadeSchema = z.object({
  elegivel: z.boolean(),
  motivo: z.string().optional(),
  proxima_data_permitida: z.string().optional(),
})

export default function AgendamentoPaciente() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loadingEligibilidade, setLoadingEligibilidade] = useState(true)
  const [eligibilidade, setEligibilidade] = useState<z.infer<typeof elegibilidadeSchema> | null>(
    null,
  )

  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slots, setSlots] = useState<SlotDisponivel[]>([])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const { today, maxDate } = useMemo(() => {
    const t = startOfDay(new Date())
    return { today: t, maxDate: addMonths(t, 2) }
  }, [])

  useEffect(() => {
    if (!user) return

    async function checkEligibility() {
      setLoadingEligibilidade(true)
      const dateStr = today.toISOString().split('T')[0]
      const { data, error } = await validarElegibilidade(user.id, dateStr)

      if (error) {
        toast({
          title: 'Erro ao verificar elegibilidade',
          description: error,
          variant: 'destructive',
        })
        setEligibilidade({ elegivel: false, motivo: 'Erro de comunicação com o servidor' })
      } else {
        try {
          const parsed = elegibilidadeSchema.parse(data)
          setEligibilidade(parsed)
        } catch (err) {
          toast({
            title: 'Erro de validação',
            description: 'Formato de resposta inválido',
            variant: 'destructive',
          })
          setEligibilidade({ elegivel: false, motivo: 'Erro interno ao validar elegibilidade.' })
        }
      }
      setLoadingEligibilidade(false)
    }

    checkEligibility()
  }, [user, toast, today])

  useEffect(() => {
    if (eligibilidade?.elegivel) {
      async function loadSlots() {
        setLoadingSlots(true)
        const { data, error } = await getSlotsDisponiveis(today, maxDate)
        if (error) {
          toast({
            title: 'Erro ao carregar horários',
            description: error,
            variant: 'destructive',
          })
        } else {
          setSlots(data || [])
        }
        setLoadingSlots(false)
      }
      loadSlots()
    }
  }, [eligibilidade, toast, today, maxDate])

  const availableDates = useMemo(() => {
    const dates = new Map<string, Date>()
    slots.forEach((slot) => {
      const dateStr = slot.data.split(' ')[0]
      if (!dates.has(dateStr)) {
        const [year, month, day] = dateStr.split('-')
        dates.set(dateStr, new Date(Number(year), Number(month) - 1, Number(day)))
      }
    })
    return Array.from(dates.values())
  }, [slots])

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter((slot) => {
      const dateStr = slot.data.split(' ')[0]
      const [year, month, day] = dateStr.split('-')
      const slotDate = new Date(Number(year), Number(month) - 1, Number(day))
      return isSameDay(slotDate, selectedDate)
    })
  }, [slots, selectedDate])

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlot(slotId)
  }

  const handleAgendar = async () => {
    if (!selectedSlot) return
    toast({
      title: 'Agendamento em processamento...',
      description: 'Esta funcionalidade será concluída em breve.',
    })
  }

  if (loadingEligibilidade) {
    return (
      <div className="container max-w-4xl py-10 space-y-6 animate-fade-in-up">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row gap-8">
            <Skeleton className="h-[350px] w-full md:w-[350px] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (eligibilidade && !eligibilidade.elegivel) {
    let daysDiff = null
    if (eligibilidade.proxima_data_permitida) {
      const [year, month, day] = eligibilidade.proxima_data_permitida
        .split('T')[0]
        .split(' ')[0]
        .split('-')
      const prox = new Date(Number(year), Number(month) - 1, Number(day))
      daysDiff = differenceInDays(prox, today)
    }

    return (
      <div className="container max-w-2xl py-10 animate-fade-in-up">
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold ml-2">Agendamento Bloqueado</AlertTitle>
          <AlertDescription className="ml-2 mt-2 text-base space-y-2">
            <p>
              {eligibilidade.motivo ||
                'Você não está elegível para agendar uma nova consulta no momento.'}
            </p>
            {daysDiff !== null && daysDiff > 0 && (
              <p className="font-medium">Você pode agendar em {daysDiff} dia(s).</p>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10 animate-fade-in-up">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agendar Consulta</h1>
        <p className="text-muted-foreground">
          Selecione uma data no calendário para visualizar os horários disponíveis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <Card className="md:col-span-5 lg:col-span-4 h-fit border-none shadow-md">
          <CardContent className="p-0 sm:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setSelectedSlot(null)
              }}
              locale={ptBR}
              disabled={(date) => {
                const normalizedDate = startOfDay(date)
                if (normalizedDate < today || normalizedDate > maxDate) return true
                return !availableDates.some((availDate) => isSameDay(availDate, normalizedDate))
              }}
              modifiers={{
                available: availableDates,
              }}
              modifiersClassNames={{
                available:
                  'bg-primary/20 text-primary font-bold hover:bg-primary/30 dark:bg-primary/30 dark:text-primary',
              }}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <Card className="min-h-[400px] border-none shadow-md">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {selectedDate
                  ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : 'Selecione uma data'}
              </CardTitle>
              {selectedDate && (
                <CardDescription>
                  {slotsForSelectedDate.length}{' '}
                  {slotsForSelectedDate.length === 1
                    ? 'horário disponível'
                    : 'horários disponíveis'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-4">
                  <CalendarIcon className="w-12 h-12 opacity-20" />
                  <p>Escolha um dia no calendário para ver os horários</p>
                </div>
              ) : loadingSlots ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : slotsForSelectedDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-4">
                  <Clock className="w-12 h-12 opacity-20" />
                  <p>Nenhum slot disponível neste período</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {slotsForSelectedDate.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        'flex flex-col p-4 rounded-xl border transition-all cursor-pointer group hover:border-primary hover:shadow-md',
                        selectedSlot === slot.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-card hover:border-primary/50',
                      )}
                      onClick={() => handleSelectSlot(slot.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <Clock className="w-4 h-4 text-primary" />
                          {slot.hora_inicio} - {slot.hora_fim}
                        </div>
                        {slot.tipo === 'presencial' ? (
                          <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <Stethoscope className="w-3 h-3" /> Presencial
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded-full">
                            <Video className="w-3 h-3" /> Telemedicina
                          </div>
                        )}
                      </div>

                      <Button
                        variant={selectedSlot === slot.id ? 'default' : 'outline'}
                        className={cn(
                          'w-full mt-auto transition-colors',
                          selectedSlot === slot.id
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground',
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectSlot(slot.id)
                        }}
                      >
                        {selectedSlot === slot.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedSlot && (
                <div className="mt-8 pt-6 border-t flex justify-end animate-fade-in-up">
                  <Button size="lg" onClick={handleAgendar} className="font-semibold shadow-md">
                    Confirmar Agendamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
