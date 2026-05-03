import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createAppointment, checkDailyCapacity } from '@/services/appointments'
import { startOfDay, format } from 'date-fns'

const appointmentSchema = z.object({
  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine((d) => {
      const date = new Date(d + 'T12:00:00')
      return date.getDay() !== 0
    }, 'Agendamentos não são permitidos aos domingos')
    .refine((d) => {
      const date = new Date(d + 'T00:00:00')
      return date >= startOfDay(new Date())
    }, 'A data não pode estar no passado'),
  time: z.string().min(1, 'Horário é obrigatório'),
  type: z.enum(['presencial', 'telemedicina'], { required_error: 'Tipo é obrigatório' }),
  title: z.string().min(3, 'Motivo deve ter pelo menos 3 caracteres'),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

const timeOptions = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const min = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${min}`
})

interface Props {
  userId: string
  subscriptionId: string
  onSuccess: () => void
}

export function AppointmentForm({ userId, subscriptionId, onSuccess }: Props) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { date: '', time: '', type: 'telemedicina', title: '' },
  })

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      const count = await checkDailyCapacity(values.date, values.type)
      const max = values.type === 'presencial' ? 5 : 10
      if (count >= max) {
        toast.error(
          `Limite de agendamentos atingido para este dia (${values.type}). Tente outra data.`,
        )
        return
      }

      const dateTime = new Date(`${values.date}T${values.time}:00`).toISOString()

      await createAppointment({
        user: userId,
        title: values.title,
        date: dateTime,
        type: values.type,
        status: 'agendado',
        subscription: subscriptionId,
      })

      toast.success('Agendamento confirmado!')
      form.reset()
      onSuccess()
    } catch (err) {
      toast.error('Erro ao agendar consulta. Tente novamente.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Consulta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="telemedicina">Telemedicina</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" min={format(new Date(), 'yyyy-MM-dd')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Consulta</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Acompanhamento nutricional..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
        </Button>
      </form>
    </Form>
  )
}
