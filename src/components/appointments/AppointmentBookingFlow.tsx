import { useState } from 'react'
import { AppointmentScheduler } from './AppointmentScheduler'
import { AppointmentForm } from './AppointmentForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  userId: string
  subscriptionId?: string
  isAdmin?: boolean
  onSuccess?: () => void
}

export function AppointmentBookingFlow({ userId, subscriptionId, isAdmin, onSuccess }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const { user } = useAuth()
  const effectiveIsAdmin = isAdmin ?? user?.role === 'admin'

  if (selectedSlot) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <Button variant="ghost" onClick={() => setSelectedSlot(null)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Calendário
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Agendamento</CardTitle>
            <CardDescription>
              {format(selectedSlot, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              selectedDate={selectedSlot}
              currentUserId={userId}
              isAdmin={effectiveIsAdmin}
              subscriptionId={subscriptionId}
              onSuccess={() => {
                setSelectedSlot(null)
                if (onSuccess) onSuccess()
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="animate-in fade-in slide-in-from-left-4 duration-300">
      <CardHeader>
        <CardTitle>Escolha um Horário</CardTitle>
        <CardDescription>Selecione a data e o horário para agendar.</CardDescription>
      </CardHeader>
      <CardContent>
        <AppointmentScheduler onSelectSlot={setSelectedSlot} isAdmin={effectiveIsAdmin} />
      </CardContent>
    </Card>
  )
}
