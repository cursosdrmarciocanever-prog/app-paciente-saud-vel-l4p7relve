import pb from '@/lib/pocketbase/client'

export interface ItemCarrinho {
  catalogo_id: string
  produto: string
  valor_unitario?: number
  quantidade: number
}

export interface PedidoCatalogo {
  id: string
  usuario_id: string
  catalogo_id?: string
  produto?: string
  valor_unitario?: number
  quantidade?: number
  itens?: string // JSON de ItemCarrinho[]
  total?: number
  status?: 'solicitado' | 'confirmado' | 'cancelado'
  observacao?: string
  created: string
  updated: string
  expand?: { usuario_id?: { name?: string; email?: string } }
}

// Cria um pedido com VÁRIOS itens (carrinho).
export const criarPedidoCarrinho = (data: {
  usuario_id: string
  itens: ItemCarrinho[]
  total: number
  observacao?: string
}) =>
  pb.collection('pedidos_catalogo').create<PedidoCatalogo>({
    usuario_id: data.usuario_id,
    itens: JSON.stringify(data.itens),
    quantidade: data.itens.reduce((s, i) => s + i.quantidade, 0),
    produto:
      data.itens.length === 1
        ? data.itens[0].produto
        : `${data.itens.length} itens`,
    total: data.total,
    observacao: data.observacao,
    status: 'solicitado',
  })

export const parseItens = (p: PedidoCatalogo): ItemCarrinho[] => {
  if (p.itens) {
    try {
      return JSON.parse(p.itens)
    } catch (_) {
      /* ignora */
    }
  }
  // compat. pedidos antigos de item único
  if (p.produto) {
    return [
      {
        catalogo_id: p.catalogo_id || '',
        produto: p.produto,
        valor_unitario: p.valor_unitario,
        quantidade: p.quantidade || 1,
      },
    ]
  }
  return []
}

export const criarPedidoCatalogo = (data: {
  usuario_id: string
  catalogo_id: string
  produto: string
  valor_unitario?: number
  quantidade: number
  total?: number
  observacao?: string
}) =>
  pb.collection('pedidos_catalogo').create<PedidoCatalogo>({
    ...data,
    status: 'solicitado',
  })

export const getMeusPedidosCatalogo = (usuarioId: string) =>
  pb.collection('pedidos_catalogo').getFullList<PedidoCatalogo>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-created',
  })

// Admin: todos os pedidos (expande o paciente)
export const getTodosPedidosCatalogo = () =>
  pb.collection('pedidos_catalogo').getFullList<PedidoCatalogo>({
    sort: '-created',
    expand: 'usuario_id',
  })

export const atualizarStatusPedidoCatalogo = (
  id: string,
  status: 'solicitado' | 'confirmado' | 'cancelado',
) => pb.collection('pedidos_catalogo').update<PedidoCatalogo>(id, { status })
