import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CalendarX2 } from 'lucide-react'
import { getAppointments, updateAppointment, AppointmentRecord } from '@/services/appointments'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function AppointmentList({ onScheduleClick }: { onScheduleClick: () => void }) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = () => {
    setLoading(true)
    setError(false)
    getAppointments()
      .then((data) => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
        toast.error('Erro ao carregar dados')
      })
  }

  useEffect(() => {
    loadData()
    window.addEventListener('appointments-updated', loadData)
    return () => window.removeEventListener('appointments-updated', loadData)
  }, [])

  const handleCancel = async (id: string) => {
    try {
      await updateAppointment(id, { status: 'cancelado' })
      toast.success('Consulta cancelada com sucesso.')
      window.dispatchEvent(new Event('appointments-updated'))
    } catch (e) {
      toast.error('Erro ao cancelar consulta. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg flex flex-col items-center mt-6">
        <p className="text-muted-foreground mb-4">Erro ao carregar dados.</p>
        <Button onClick={loadData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg flex flex-col items-center mt-6">
        <CalendarX2 className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum agendamento</h3>
        <p className="text-muted-foreground mb-6 text-sm max-w-sm text-center">
          Você ainda não possui consultas agendadas. Mantenha sua saúde em dia agendando um horário.
        </p>
        <Button onClick={onScheduleClick}>Agendar Consulta</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-6">
      {appointments.map((apt) => {
        const dateObj = parseISO(apt.date)
        const isScheduled = apt.status === 'agendado'
        const isCanceled = apt.status === 'cancelado'

        return (
          <Card key={apt.id} className="border-border/50 shadow-sm overflow-hidden">
            <div
              className={`h-1 w-full ${isScheduled ? 'bg-primary' : isCanceled ? 'bg-destructive' : 'bg-emerald-500'}`}
            />
            <CardContent className="p-5 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-muted rounded-xl p-3 text-center min-w-[70px] shrink-0 border">
                  <span className="block text-xs font-semibold text-muted-foreground uppercase">
                    {format(dateObj, 'MMM', { locale: ptBR })}
                  </span>
                  <span className="block text-2xl font-bold">{format(dateObj, 'dd')}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{apt.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {format(dateObj, 'HH:mm')}
                    </span>
                    <span className="capitalize px-2 py-0.5 bg-muted rounded-md text-xs">
                      {apt.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 md:w-auto w-full">
                <Badge
                  variant={isScheduled ? 'default' : isCanceled ? 'destructive' : 'outline'}
                  className="w-full sm:w-auto justify-center capitalize"
                >
                  {apt.status}
                </Badge>

                {isScheduled && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Cancelar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja cancelar esta consulta? Esta ação não poderá ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancel(apt.id)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Sim, cancelar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
