import { useEffect, useMemo, useState } from 'react'
import { getCatalogoInjetaveis, type CatalogoInjetavel } from '@/services/catalogo'
import { criarPedidoCarrinho, type ItemCarrinho } from '@/services/pedidos-catalogo'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Syringe,
  Search,
  Loader2,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Trash2,
} from 'lucide-react'

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null || value === 0) return 'Sob consulta'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface LinhaCarrinho {
  item: CatalogoInjetavel
  qtd: number
}

export function PrateleiraInjetaveis() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<CatalogoInjetavel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [composicaoAberta, setComposicaoAberta] = useState<Record<string, boolean>>({})

  const [carrinho, setCarrinho] = useState<Record<string, LinhaCarrinho>>({})
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setData(await getCatalogoInjetaveis())
    } catch (_) {
      /* silencioso */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('catalogo_injetaveis', () => loadData())

  const filtered = data.filter(
    (i) =>
      i.produto.toLowerCase().includes(search.toLowerCase()) ||
      (i.funcao && i.funcao.toLowerCase().includes(search.toLowerCase())) ||
      (i.tipo && i.tipo.toLowerCase().includes(search.toLowerCase())),
  )

  const linhas = useMemo(() => Object.values(carrinho), [carrinho])
  const totalItens = linhas.reduce((s, l) => s + l.qtd, 0)
  const totalValor = linhas.reduce((s, l) => s + (l.item.valor || 0) * l.qtd, 0)

  const adicionar = (item: CatalogoInjetavel) => {
    setCarrinho((prev) => {
      const atual = prev[item.id]
      return { ...prev, [item.id]: { item, qtd: (atual?.qtd || 0) + 1 } }
    })
    toast({ title: 'Adicionado ao carrinho', description: item.produto })
  }

  const ajustar = (id: string, delta: number) => {
    setCarrinho((prev) => {
      const atual = prev[id]
      if (!atual) return prev
      const nova = atual.qtd + delta
      if (nova <= 0) {
        const copia = { ...prev }
        delete copia[id]
        return copia
      }
      return { ...prev, [id]: { ...atual, qtd: nova } }
    })
  }

  const remover = (id: string) => {
    setCarrinho((prev) => {
      const copia = { ...prev }
      delete copia[id]
      return copia
    })
  }

  const finalizar = async () => {
    if (!user?.id || linhas.length === 0) return
    setEnviando(true)
    try {
      const itens: ItemCarrinho[] = linhas.map((l) => ({
        catalogo_id: l.item.id,
        produto: l.item.produto,
        valor_unitario: l.item.valor,
        quantidade: l.qtd,
      }))
      await criarPedidoCarrinho({ usuario_id: user.id, itens, total: totalValor })
      toast({
        title: 'Pedido realizado!',
        description: 'A equipe da clínica vai confirmar e entrar em contato.',
      })
      setCarrinho({})
      setCarrinhoAberto(false)
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível concluir o pedido.', variant: 'destructive' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por produto ou função..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          Nenhum produto disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Syringe className="h-5 w-5" />
                  </div>
                  {item.tipo && (
                    <Badge variant="outline" className="font-normal">
                      {item.tipo}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{item.produto}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.funcao || 'Suplemento injetável.'}
                </p>
                {item.composicao && (
                  <div className="rounded-lg bg-secondary/40">
                    <button
                      onClick={() =>
                        setComposicaoAberta((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="w-full flex items-center justify-between p-3 text-xs font-semibold text-foreground"
                    >
                      <span>Composição</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          composicaoAberta[item.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {composicaoAberta[item.id] && (
                      <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-7 pr-3 pb-3">
                        {item.composicao
                          .split('\n')
                          .filter((l) => l.trim())
                          .map((l, i) => (
                            <li key={i}>{l.trim()}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
                {item.via_administracao && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Via:</span>{' '}
                    {item.via_administracao}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
                <span className="text-lg font-bold text-primary">{formatCurrency(item.valor)}</span>
                <Button size="sm" onClick={() => adicionar(item)}>
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> Adicionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Barra fixa do carrinho */}
      {totalItens > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border p-3 md:left-[16rem]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-semibold text-foreground">{totalItens} item(s)</span>
              <span className="text-muted-foreground"> · {formatCurrency(totalValor)}</span>
            </div>
            <Button onClick={() => setCarrinhoAberto(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Ver carrinho
            </Button>
          </div>
        </div>
      )}

      {/* Modal do carrinho */}
      <Dialog open={carrinhoAberto} onOpenChange={setCarrinhoAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Seu carrinho</DialogTitle>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto space-y-3 py-2">
            {linhas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Carrinho vazio.</p>
            ) : (
              linhas.map(({ item, qtd }) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.produto}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.valor)}
                      {item.valor ? ` · subtotal ${formatCurrency(item.valor * qtd)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => ajustar(item.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{qtd}</span>
                    <Button variant="outline" size="icon" onClick={() => ajustar(item.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remover(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(totalValor)}</span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCarrinhoAberto(false)} disabled={enviando}>
              Continuar comprando
            </Button>
            <Button onClick={finalizar} disabled={enviando || linhas.length === 0}>
              {enviando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Finalizar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
