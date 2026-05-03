import { useEffect, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getSubscriptions, updateSubscription, cancelSubscription } from '@/services/admin'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
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

const subSchema = z.object({
  plan: z.enum(['entry', 'intermediate', 'premium', 'diamond']),
  status: z.enum(['active', 'pending_payment', 'canceled', 'suspended']),
})

export function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<any>(null)

  const loadSubs = () => getSubscriptions().then(setSubs)
  useEffect(() => {
    loadSubs()
  }, [])
  useRealtime('subscriptions', loadSubs)

  const filteredSubs = useMemo(() => {
    if (statusFilter === 'all') return subs
    return subs.filter((s) => s.status === statusFilter)
  }, [subs, statusFilter])

  const form = useForm({
    resolver: zodResolver(subSchema),
    defaultValues: { plan: 'entry', status: 'active' },
  })

  useEffect(() => {
    if (editingSub) form.reset({ plan: editingSub.plan, status: editingSub.status })
  }, [editingSub, form, open])

  const onSubmit = async (data: any) => {
    try {
      await updateSubscription(editingSub.id, data)
      toast({ title: 'Sucesso', description: 'Assinatura atualizada.' })
      setOpen(false)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleCancel = async (id: string) => {
    if (
      confirm('Tem certeza que deseja cancelar esta assinatura? O usuário perderá o acesso ativo.')
    ) {
      await cancelSubscription(id)
      toast({ title: 'Cancelada', description: 'Assinatura cancelada com sucesso.' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gerenciamento de Assinaturas</h1>
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="pending_payment">Pendente</SelectItem>
            <SelectItem value="suspended">Suspenso</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário (Email)</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Renovação</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSubs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.expand?.user?.email || '-'}</TableCell>
                  <TableCell className="capitalize">{s.plan}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
                    {s.start_date ? new Date(s.start_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    {s.renewal_date ? new Date(s.renewal_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>R$ {s.monthly_price}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSub(s)
                        setOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    {s.status !== 'canceled' && (
                      <Button variant="destructive" size="sm" onClick={() => handleCancel(s.id)}>
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Assinatura</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry">Entry</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="pending_payment">Pendente de Pagamento</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
