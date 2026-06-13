import pb from '@/lib/pocketbase/client'

export interface Injetavel {
  id: string
  nome: string
  descricao: string
  funcionalidades: string
  preco_ampola: number
  preco_kit: number
  quantidade_kit: number
  imagem: string
  ativo: boolean
  collectionId: string
}

export interface PedidoInjetavel {
  id: string
  usuario_id: string
  injetavel_id: string
  tipo_compra: 'ampola' | 'kit'
  quantidade: number
  preco_total: number
  opcao_entrega: 'agendar_clinica' | 'enviar_endereco'
  status: 'pendente_pagamento' | 'pago' | 'agendado' | 'enviado' | 'cancelado'
  data_agendamento?: string
  endereco_entrega?: string
  expand?: {
    injetavel_id: Injetavel
  }
}

export const getInjetaveis = async (): Promise<Injetavel[]> => {
  try {
    return await pb.collection('injetaveis').getFullList({
      filter: 'ativo = true',
      sort: 'nome',
    })
  } catch (error) {
    console.error('Error fetching injectables', error)
    throw error
  }
}

export const getAllInjetaveis = async (): Promise<Injetavel[]> => {
  return await pb.collection('injetaveis').getFullList({
    sort: 'nome',
  })
}

export const createInjetavel = async (data: FormData): Promise<Injetavel> => {
  return await pb.collection('injetaveis').create(data)
}

export const updateInjetavel = async (id: string, data: FormData): Promise<Injetavel> => {
  return await pb.collection('injetaveis').update(id, data)
}

export const deleteInjetavel = async (id: string): Promise<void> => {
  return await pb.collection('injetaveis').delete(id)
}

export const getPedidos = async (usuarioId: string): Promise<PedidoInjetavel[]> => {
  try {
    return await pb.collection('pedidos_injetaveis').getFullList({
      filter: `usuario_id = "${usuarioId}"`,
      sort: '-created',
      expand: 'injetavel_id',
    })
  } catch (error) {
    console.error('Error fetching orders', error)
    throw error
  }
}

export const createPedido = async (data: Partial<PedidoInjetavel>): Promise<PedidoInjetavel> => {
  try {
    return await pb.collection('pedidos_injetaveis').create(data)
  } catch (error) {
    console.error('Error creating order', error)
    throw error
  }
}

export const processInjetavelPayment = async (data: {
  injetavel_id: string
  tipo_compra: 'ampola' | 'kit'
  quantidade: number
  opcao_entrega: 'agendar_clinica' | 'enviar_endereco'
  slot_id?: string
  endereco?: string
  card_number?: string
}): Promise<{ pedido_id: string }> => {
  return await pb.send('/backend/v1/payment/injetavel', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getInjetavelImageUrl = (record: Injetavel) => {
  if (!record.imagem) return `https://img.usecurling.com/p/400/300?q=medicine&color=gold`
  return pb.files.getUrl(record, record.imagem)
}
