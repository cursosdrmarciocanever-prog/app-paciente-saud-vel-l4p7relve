import { useState, useEffect, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  format,
  setHours,
  setMinutes,
  startOfMonth,
  endOfMonth,
  parseISO,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getOccupiedSlots } from '@/services/appointments'
import { getSettings } from '@/services/settings'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock } from 'lucide-react'

interface Props {
  onSelectSlot: (date: Date) => void
  isAdmin?: boolean
  type?: 'presencial' | 'telemedicina'
}

export function AppointmentScheduler({ onSelectSlot, isAdmin, type }: Props) {
  const [month, setMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [occupied, setOccupied] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [businessHours, setBusinessHours] = useState({ start: '08:00', end: '18:00' })

  const loadData = async (m: Date) => {
    setLoading(true)
    const start = startOfMonth(m).toISOString().replace('T', ' ')
    const end = endOfMonth(m).toISOString().replace('T', ' ')
    const [slots, settings] = await Promise.all([getOccupiedSlots(start, end, type), getSettings()])
    setOccupied(slots)
    if (settings) {
      setBusinessHours({
        start: settings.start_time || '08:00',
        end: settings.end_time || '18:00',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData(month)
    const handleUpdate = () => loadData(month)
    window.addEventListener('appointments-updated', handleUpdate)
    return () => window.removeEventListener('appointments-updated', handleUpdate)
  }, [month])

  const occupiedDates = useMemo(() => {
    return occupied
      .filter((s) => !s.endsWith(' FULL'))
      .map((s) => {
        const iso = s.includes('T') ? s : s.replace(' ', 'T')
        return parseISO(iso).getTime()
      })
  }, [occupied])

  const fullDays = useMemo(() => {
    return occupied.filter((s) => s.endsWith(' FULL')).map((s) => s.split(' ')[0])
  }, [occupied])

  const slots = useMemo(() => {
    if (!selectedDate) return []
    const times: { date: Date; occupied: boolean; past: boolean }[] = []
    const now = new Date()

    let startHour = 0
    let startMinute = 0
    let endHour = 23
    let endMinute = 59

    if (!isAdmin) {
      const [sH, sM] = businessHours.start.split(':').map(Number)
      const [eH, eM] = businessHours.end.split(':').map(Number)
      startHour = sH
      startMinute = sM
      endHour = eH
      endMinute = eM
    }

    const iterStartHour = isAdmin ? 0 : startHour
    const iterEndHour = isAdmin ? 23 : endHour

    for (let i = iterStartHour; i <= iterEndHour; i++) {
      for (const m of [0, 30]) {
        if (!isAdmin) {
          if (i === startHour && m < startMinute) continue
          if (i === endHour && m >= endMinute) continue
        }

        const slotDate = setMinutes(setHours(selectedDate, i), m)
        slotDate.setSeconds(0, 0)
        const isOccupied = occupiedDates.includes(slotDate.getTime())
        times.push({
          date: slotDate,
          occupied: !isAdmin && isOccupied,
          past: !isAdmin && slotDate.getTime() <= now.getTime(),
        })
      }
    }
    return times
  }, [selectedDate, occupiedDates, isAdmin, businessHours])

  const hasAppointments = (day: Date) => {
    return occupiedDates.some((time) => isSameDay(new Date(time), day))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex justify-center lg:justify-start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
          locale={ptBR}
          disabled={(date) => {
            if (isAdmin) return false
            if (date < startOfDay(new Date()) || date.getDay() === 0) return true
            const dateStr = format(date, 'yyyy-MM-dd')
            return fullDays.includes(dateStr)
          }}
          className="border rounded-md p-3"
          modifiers={{
            hasAppt: (date) => hasAppointments(date),
            full: (date) => fullDays.includes(format(date, 'yyyy-MM-dd')),
          }}
          modifiersStyles={{
            hasAppt: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: 'hsl(var(--primary))',
            },
          }}
        />
      </div>
      <div className="w-full lg:w-64 flex flex-col h-[350px]">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {selectedDate
            ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
            : 'Selecione uma data'}
        </h4>
        <ScrollArea className="flex-1 border rounded-md p-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !selectedDate ? (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Escolha um dia no calendário para ver os horários.
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Nenhum horário disponível.
            </p>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {slots.map((slot, i) => (
                <Button
                  key={i}
                  variant={slot.occupied || slot.past ? 'secondary' : 'outline'}
                  disabled={slot.occupied || slot.past}
                  className={cn('justify-start', slot.occupied && 'opacity-50')}
                  onClick={() => onSelectSlot(slot.date)}
                >
                  {format(slot.date, 'HH:mm')}
                  {slot.occupied && (
                    <span className="hidden lg:inline ml-auto text-xs">Ocupado</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
