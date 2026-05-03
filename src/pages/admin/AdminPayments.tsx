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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPayments, refundPayment } from '@/services/admin'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

export function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  const loadData = () => getPayments().then(setPayments)
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('payments', loadData)

  const filtered = useMemo(() => {
    let res = payments
    if (search)
      res = res.filter((p) => p.expand?.user?.email?.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'all') res = res.filter((p) => p.status === statusFilter)
    return res
  }, [payments, search, statusFilter])

  const handleRefund = async (id: string) => {
    if (
      confirm(
        'Aviso Crítico: Deseja realmente estornar este pagamento? Esta ação acionará o gateway financeiro e não pode ser desfeita.',
      )
    ) {
      try {
        await refundPayment(id)
        toast({
          title: 'Pagamento Reembolsado',
          description: 'O valor foi estornado e o status atualizado.',
        })
      } catch (err) {
        toast({
          title: 'Falha',
          description: 'Ocorreu um erro ao processar o reembolso.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rastreamento Financeiro</h1>
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por email do usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
            <SelectItem value="reembolsado">Reembolsado</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhum pagamento registrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.expand?.user?.email}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    R$ {p.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize">{p.status}</TableCell>
                  <TableCell className="capitalize">{p.method.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {p.payment_date ? new Date(p.payment_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>{new Date(p.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    {p.status === 'aprovado' && (
                      <Button variant="secondary" size="sm" onClick={() => handleRefund(p.id)}>
                        Reembolsar
                      </Button>
                    )}
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
