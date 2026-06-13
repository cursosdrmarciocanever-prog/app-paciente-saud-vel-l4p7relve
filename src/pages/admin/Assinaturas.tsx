import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionBadge } from '@/components/SubscriptionBadge'

export default function AdminAssinaturas() {
  const [assinaturas, setAssinaturas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchAssinaturas = async () => {
    try {
      const records = await pb.collection('assinaturas').getFullList({
        expand: 'usuario_id',
        sort: '-created',
      })
      setAssinaturas(records)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar assinaturas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssinaturas()
  }, [])

  useRealtime('assinaturas', () => {
    fetchAssinaturas()
  })

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await pb.collection('assinaturas').update(id, { status: newStatus })
      toast({
        title: 'Status atualizado',
        description: 'O status da assinatura foi alterado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Assinaturas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os planos e status de assinaturas dos usuários.
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : assinaturas.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Nenhuma assinatura encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Renovação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assinaturas.map((ass) => {
                  const user = ass.expand?.usuario_id
                  return (
                    <TableRow key={ass.id}>
                      <TableCell className="font-medium">{user?.name || 'Desconhecido'}</TableCell>
                      <TableCell className="text-muted-foreground">{user?.email || '-'}</TableCell>
                      <TableCell>{ass.plano || '-'}</TableCell>
                      <TableCell>
                        {ass.data_inicio
                          ? new Date(ass.data_inicio).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {ass.data_renovacao
                          ? new Date(ass.data_renovacao).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <SubscriptionBadge status={ass.status} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ass.status}
                          onValueChange={(val) => handleStatusChange(ass.id, val)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativa">Ativa</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="atrasada">Atrasada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
