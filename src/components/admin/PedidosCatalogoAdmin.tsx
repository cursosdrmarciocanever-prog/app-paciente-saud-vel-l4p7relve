import { useEffect, useState } from 'react'
import {
  getTodosPedidosCatalogo,
  atualizarStatusPedidoCatalogo,
  parseItens,
  type PedidoCatalogo,
} from '@/services/pedidos-catalogo'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart, Check, X } from 'lucide-react'

const formatCurrency = (v?: number) =>
  v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—'

const statusBadge: Record<string, string> = {
  solicitado: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-700',
}

export function PedidosCatalogoAdmin() {
  const { toast } = useToast()
  const [pedidos, setPedidos] = useState<PedidoCatalogo[]>([])
  const [pacientes, setPacientes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [peds, lista] = await Promise.all([
        getTodosPedidosCatalogo(),
        pb.send<any[]>('/backend/v1/admin/usuarios', { method: 'GET' }).catch(() => []),
      ])
      const mapa: Record<string, string> = {}
      for (const u of lista || []) mapa[u.id] = u.name || u.email || 'Paciente'
      setPacientes(mapa)
      setPedidos(peds)
    } catch (_) {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('pedidos_catalogo', () => load())

  const mudarStatus = async (id: string, status: 'confirmado' | 'cancelado') => {
    try {
      await atualizarStatusPedidoCatalogo(id, status)
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      toast({ title: status === 'confirmado' ? 'Pedido confirmado' : 'Pedido cancelado' })
    } catch (_) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-12 text-muted-foreground">
        <ShoppingCart className="h-8 w-8" />
        <p className="text-sm">Nenhum pedido de injetáveis ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pedidos.map((p) => {
        const itens = parseItens(p)
        return (
        <Card key={p.id}>
          <CardContent className="p-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {itens.length > 1 ? `${itens.length} itens` : itens[0]?.produto || p.produto}
                </h3>
                <Badge className={statusBadge[p.status || 'solicitado'] + ' border-0'}>
                  {p.status || 'solicitado'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pacientes[p.usuario_id] || 'Paciente'} · {formatCurrency(p.total)} ·{' '}
                {new Date(p.created).toLocaleDateString('pt-BR')}
              </p>
              {itens.length > 0 && (
                <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  {itens.map((it, i) => (
                    <li key={i}>
                      {it.quantidade}x {it.produto}
                      {it.valor_unitario ? ` (${formatCurrency(it.valor_unitario)})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {p.status !== 'confirmado' && p.status !== 'cancelado' && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => mudarStatus(p.id, 'confirmado')}>
                  <Check className="h-4 w-4 mr-1" /> Confirmar
                </Button>
                <Button size="sm" variant="outline" onClick={() => mudarStatus(p.id, 'cancelado')}>
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        )
      })}
    </div>
  )
}
