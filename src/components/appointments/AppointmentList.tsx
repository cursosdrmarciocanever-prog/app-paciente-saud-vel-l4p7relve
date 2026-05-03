import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Loader2 } from 'lucide-react'
import { getAppointments, AppointmentRecord } from '@/services/appointments'
import { format, parseISO } from 'date-fns'

export function AppointmentList() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    getAppointments()
      .then((data) => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    window.addEventListener('appointments-updated', loadData)
    return () => window.removeEventListener('appointments-updated', loadData)
  }, [])

  if (loading)
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )

  if (appointments.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
        Nenhuma consulta agendada.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => {
        const dateObj = parseISO(apt.date)
        const isConfirmed = apt.status === 'Confirmado'
        return (
          <Card key={apt.id} className="border-border/50 shadow-sm overflow-hidden">
            <div
              className={`h-1 w-full ${isConfirmed ? 'bg-primary' : apt.status === 'Cancelado' ? 'bg-destructive' : 'bg-amber-400'}`}
            />
            <CardContent className="p-5 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-muted rounded-xl p-3 text-center min-w-[70px] shrink-0 border">
                  <span className="block text-xs font-semibold text-muted-foreground uppercase">
                    {format(dateObj, 'MMM')}
                  </span>
                  <span className="block text-2xl font-bold">{format(dateObj, 'dd')}</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{apt.title}</h4>
                  <p className="text-muted-foreground text-sm">{apt.notes || 'Sem observações'}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {format(dateObj, 'HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 md:w-auto w-full">
                <Badge
                  variant={
                    isConfirmed ? 'default' : apt.status === 'Cancelado' ? 'destructive' : 'outline'
                  }
                  className="w-full sm:w-auto justify-center"
                >
                  {apt.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
