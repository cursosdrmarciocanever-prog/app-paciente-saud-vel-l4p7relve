import { MOCK_APPOINTMENTS } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppointmentList() {
  return (
    <div className="space-y-4">
      {MOCK_APPOINTMENTS.map((apt) => (
        <Card key={apt.id} className="border-border/50 shadow-sm overflow-hidden">
          <div
            className={`h-1 w-full ${apt.status === 'Confirmado' ? 'bg-primary' : 'bg-amber-400'}`}
          />
          <CardContent className="p-5 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-muted rounded-xl p-3 text-center min-w-[70px] shrink-0 border">
                <span className="block text-xs font-semibold text-muted-foreground uppercase">
                  {apt.date.split('/')[1]}
                </span>
                <span className="block text-2xl font-bold">{apt.date.split('/')[0]}</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">{apt.doctor}</h4>
                <p className="text-muted-foreground">{apt.type}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {apt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    {apt.mode === 'Online' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {apt.mode}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:w-auto w-full">
              <Badge
                variant={apt.status === 'Confirmado' ? 'default' : 'outline'}
                className="w-full sm:w-auto justify-center"
              >
                {apt.status}
              </Badge>
              {apt.mode === 'Online' && apt.status === 'Confirmado' && (
                <Button className="w-full sm:w-auto">Acessar Sala</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed py-8 h-auto text-muted-foreground hover:text-foreground"
      >
        + Agendar Nova Consulta
      </Button>
    </div>
  )
}
