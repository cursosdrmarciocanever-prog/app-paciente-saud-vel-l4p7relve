import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Slot } from '@/services/slots'
import { startOfDay, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const parseTime = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function SlotForm({
  initialData,
  existingSlots,
  onSubmit,
  onCancel,
}: {
  initialData?: Slot
  existingSlots: Slot[]
  onSubmit: (data: any) => void
  onCancel?: () => void
}) {
  const schema = z
    .object({
      data: z.date({ required_error: 'Data é obrigatória' }),
      hora_inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora inválida'),
      hora_fim: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora inválida'),
      tipo: z.enum(['presencial', 'telemedicina'], { required_error: 'Tipo obrigatório' }),
    })
    .superRefine((val, ctx) => {
      if (!initialData && val.data < startOfDay(new Date())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['data'],
          message: 'Não pode ser no passado',
        })
      }
      if (val.hora_inicio && val.hora_fim) {
        const start = parseTime(val.hora_inicio)
        const end = parseTime(val.hora_fim)
        if (end <= start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['hora_fim'],
            message: 'Deve ser após o início',
          })
        } else if (end - start < 30) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['hora_fim'],
            message: 'Duração mínima: 30 min',
          })
        }

        const hasOverlap = existingSlots.some((s) => {
          if (initialData && s.id === initialData.id) return false
          if (s.data.substring(0, 10) !== format(val.data, 'yyyy-MM-dd')) return false
          return start < parseTime(s.hora_fim) && end > parseTime(s.hora_inicio)
        })
        if (hasOverlap) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['hora_inicio'],
            message: 'Conflito de horário nesta data',
          })
        }
      }
    })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          data: new Date(initialData.data.replace(' ', 'T')),
          hora_inicio: initialData.hora_inicio,
          hora_fim: initialData.hora_fim,
          tipo: initialData.tipo,
        }
      : {
          tipo: 'presencial',
        },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy')
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(d) => !initialData && d < startOfDay(new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Tipo</FormLabel>
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
          <FormField
            control={form.control}
            name="hora_inicio"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Hora Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hora_fim"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Hora Fim</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="bg-[#D4A574] hover:bg-[#c39362] text-white">
            {initialData ? 'Salvar Alterações' : 'Adicionar Slot'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
