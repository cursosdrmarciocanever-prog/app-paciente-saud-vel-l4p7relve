import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getNotificationsAdmin, sendNotification } from '@/services/admin'
import { getUsers } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const notifSchema = z.object({
  user: z.string().min(1, 'Selecione um usuário'),
  type: z.enum(['email', 'sms', 'whatsapp']),
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
  message: z.string().min(5, 'Mensagem deve ter pelo menos 5 caracteres'),
})

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const loadData = () => {
    getNotificationsAdmin().then(setNotifications)
    getUsers().then(setUsers)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('notifications', () => getNotificationsAdmin().then(setNotifications))

  const form = useForm({
    resolver: zodResolver(notifSchema),
    defaultValues: { user: '', type: 'email', subject: '', message: '' },
  })

  const onSubmit = async (data: any) => {
    try {
      await sendNotification({
        ...data,
        title: data.subject, // retrocompatibilidade
        status: 'pendente',
        is_read: false,
        sent_at: new Date().toISOString(),
      })
      toast({ title: 'Notificação Fila', description: 'Sua mensagem foi agendada para envio.' })
      setOpen(false)
      form.reset()
    } catch (err: any) {
      toast({ title: 'Erro de Envio', description: err.message, variant: 'destructive' })
    }
  }

  const handleResend = async (n: any) => {
    try {
      await sendNotification({
        user: n.user,
        type: n.type || 'email',
        subject: n.subject || n.title,
        title: n.subject || n.title,
        message: n.message,
        status: 'pendente',
        is_read: false,
        sent_at: new Date().toISOString(),
      })
      toast({ title: 'Reenviado', description: 'Notificação reenfileirada com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Centro de Comunicação</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Enviar Notificação Manual</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Mensagem</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente / Usuário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal de Comunicação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Aviso Importante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo da Mensagem</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escreva a mensagem aqui..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Agendar Envio
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Envio</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Nenhuma notificação no histórico.
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{new Date(n.created).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{n.expand?.user?.email}</TableCell>
                  <TableCell className="uppercase">{n.type || 'email'}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={n.subject || n.title}>
                    {n.subject || n.title}
                  </TableCell>
                  <TableCell>{n.status || 'enviado'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleResend(n)}>
                      Reenviar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
