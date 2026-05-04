import { useState, useEffect } from 'react'
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
import { createAppointment } from '@/services/appointments'
import { getUsers } from '@/services/users'

const schema = z.object({
  type: z.enum(['presencial', 'telemedicina'], { required_error: 'Tipo é obrigatório' }),
  title: z.string().min(3, 'Motivo deve ter pelo menos 3 caracteres'),
  notes: z.string().optional(),
  userId: z.string().min(1, 'Usuário é obrigatório'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  selectedDate: Date
  currentUserId: string
  isAdmin?: boolean
  subscriptionId?: string
  onSuccess: () => void
}

export function AppointmentForm({
  selectedDate,
  currentUserId,
  isAdmin,
  subscriptionId,
  onSuccess,
}: Props) {
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'telemedicina',
      title: isAdmin ? 'Consulta' : 'Consulta de Rotina',
      notes: '',
      userId: currentUserId,
    },
  })

  useEffect(() => {
    if (isAdmin) {
      getUsers().then(setUsers).catch(console.error)
    }
  }, [isAdmin])

  const onSubmit = async (values: FormValues) => {
    try {
      await createAppointment({
        user: values.userId,
        title: values.title,
        date: selectedDate.toISOString(),
        type: values.type,
        status: 'agendado',
        subscription: subscriptionId,
        notes: values.notes,
      })
      toast.success('Agendamento realizado com sucesso!')
      form.reset()
      onSuccess()
    } catch (err) {
      toast.error('Erro ao agendar consulta. Tente novamente.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isAdmin && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Consulta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Acompanhamento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais..."
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
