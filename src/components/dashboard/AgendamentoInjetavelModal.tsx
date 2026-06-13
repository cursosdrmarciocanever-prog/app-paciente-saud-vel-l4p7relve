import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { getAvailableSlots, updateSlot, type Slot } from '@/services/slots'
import { createPedido } from '@/services/injectables'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Clock } from 'lucide-react'
import { format } from 'date-fns'

export function AgendamentoInjetavelModal({
  open,
  onClose,
  item,
}: {
  open: boolean
  onClose: () => void
  item: any | null
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  useEffect(() => {
    if (open) {
      loadSlots()
      setSelectedDate(undefined)
      setSelectedSlot(null)
    }
  }, [open])

  const loadSlots = async () => {
    try {
      setLoading(true)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const availableSlots = await getAvailableSlots(today)
      setSlots(availableSlots)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os horários.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedSlot || !user || !item) return
    setSubmitting(true)
    try {
      await createPedido({
        usuario_id: user.id,
        injetavel_id: item.id,
        quantidade: 1,
        preco_total: item.preco_ampola || item.valor || 0,
        opcao_entrega: 'agendar_clinica',
        status: 'agendado',
        data_agendamento: selectedSlot.data,
        tipo_compra: 'ampola',
      })

      await updateSlot(selectedSlot.id, { agendado: true })

      toast({
        title: 'Agendamento confirmado!',
        description: 'Sua aplicação foi agendada com sucesso.',
      })
      onClose()
    } catch (error: any) {
      toast({
        title: 'Erro ao agendar',
        description: error.message || 'Ocorreu um erro',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const slotsForSelectedDate = selectedDate
    ? slots.filter((s) => s.data.substring(0, 10) === format(selectedDate, 'yyyy-MM-dd'))
    : []

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Agendar Aplicação</DialogTitle>
          <DialogDescription>
            Selecione uma data e horário para a aplicação de{' '}
            <strong>{item?.produto || item?.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex justify-center border-r-0 sm:border-r sm:pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-48 w-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  if (date < today) return true
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return !slots.some((s) => s.data.substring(0, 10) === dateStr)
                }}
                className="rounded-md border shadow-sm p-3 pointer-events-auto"
              />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-slate-800">
              <Clock className="w-4 h-4" /> Horários Disponíveis
            </h4>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground p-4 bg-slate-50 rounded-md border border-dashed text-center">
                Selecione uma data no calendário ao lado.
              </p>
            ) : slotsForSelectedDate.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 bg-slate-50 rounded-md border border-dashed text-center">
                Nenhum horário disponível para esta data.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                {slotsForSelectedDate.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    className="w-full text-sm"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.hora_inicio} - {slot.hora_fim}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={submitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={!selectedSlot || submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
