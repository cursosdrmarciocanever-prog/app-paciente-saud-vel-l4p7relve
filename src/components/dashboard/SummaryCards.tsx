import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Bell, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { getAppointments, AppointmentRecord } from '@/services/appointments'
import { getNotifications, NotificationRecord } from '@/services/notifications'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function SummaryCards() {
  const [nextApt, setNextApt] = useState<AppointmentRecord | null>(null)
  const [latestNotif, setLatestNotif] = useState<NotificationRecord | null>(null)

  useEffect(() => {
    getAppointments()
      .then((res) => {
        const upcoming = res
          .filter((a) => a.status === 'Confirmado' || a.status === 'Pendente')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        setNextApt(upcoming || null)
      })
      .catch(console.error)

    getNotifications()
      .then((res) => {
        setLatestNotif(res[0] || null)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card className="border-border/50 shadow-sm flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Próxima Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          {nextApt ? (
            <div>
              <p className="font-bold text-lg">{nextApt.title}</p>
              <p className="text-muted-foreground">
                {format(parseISO(nextApt.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground my-4">Nenhuma consulta agendada.</p>
          )}
          <Button variant="link" className="px-0 mt-4 self-start text-primary" asChild>
            <Link to="/consultas">
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Último Aviso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          {latestNotif ? (
            <div>
              <p className="font-bold text-base line-clamp-1">{latestNotif.title}</p>
              <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                {latestNotif.message}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground my-4">Nenhuma notificação recente.</p>
          )}
          <Button variant="link" className="px-0 mt-4 self-start text-primary" asChild>
            <Link to="/">
              Ver avisos <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
