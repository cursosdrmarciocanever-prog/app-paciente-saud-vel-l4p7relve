import { useState } from 'react'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CreditCard, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createAppointment } from '@/services/appointments'
import { useAuth } from '@/hooks/use-auth'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

const appointmentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  type: z.enum(['presencial', 'telemedicina'], { required_error: 'Tipo é obrigatório' }),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

export default function Appointments() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { title: '', date: '', time: '', type: 'presencial', notes: '' },
  })

  const onSubmit = async (values: AppointmentFormValues) => {
    if (!user) return
    try {
      const dateTime = new Date(`${values.date}T${values.time}:00`).toISOString()
      await createAppointment({
        user: user.id,
        title: values.title,
        date: dateTime,
        type: values.type,
        status: 'agendado',
        notes: values.notes,
      })
      toast.success('Agendamento solicitado!')
      setOpen(false)
      form.reset()
      window.dispatchEvent(new Event('appointments-updated'))
    } catch (err) {
      toast.error('Erro ao agendar consulta.')
    }
  }

  const handleSave = () => {
    toast.success('Seu perfil foi atualizado com sucesso.')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Minhas Consultas</h2>
              <p className="text-muted-foreground">
                Gerencie seus encontros com a equipe multidisciplinar.
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agendar Consulta</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade / Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Nutricionista" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              <Input type="date" {...field} />
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
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Input placeholder="Motivo da consulta..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Confirmar Agendamento
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <AppointmentList />
        </div>

        <Card className="border-border/50 shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              Assinatura e Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="font-semibold text-foreground">Plano Saudável Premium</p>
                <p className="text-sm text-muted-foreground">Próxima cobrança em 15/05/2026</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">R$ 149,90</p>
                <p className="text-xs text-primary font-medium">Ativo</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Gerenciar Assinatura
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card className="border-border/50 shadow-sm sticky top-24">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e biometria inicial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input defaultValue="Mariana Silva" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="mariana@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input type="tel" defaultValue="(11) 98765-4321" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
              <div className="space-y-2">
                <Label>Meta de Peso (kg)</Label>
                <Input type="number" defaultValue="65" />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input type="number" defaultValue="165" />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-4">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
