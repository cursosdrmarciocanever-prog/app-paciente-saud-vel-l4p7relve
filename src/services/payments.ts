import pb from '@/lib/pocketbase/client'

export interface PaymentRecord {
  id: string
  user: string
  subscription: string
  amount: number
  status: 'pendente' | 'processando' | 'aprovado' | 'recusado' | 'reembolsado'
  method: 'cartao_credito' | 'pix' | 'boleto'
  gateway_id?: string
  payment_date?: string
  next_renewal?: string
  created: string
  updated: string
}

export const getUserPayments = async (userId: string) => {
  return pb.collection('payments').getFullList<PaymentRecord>({
    filter: `user = "${userId}"`,
    sort: '-created',
  })
}

export const processCheckout = async (
  subscriptionId: string,
  method: string,
  token: string,
  document: string,
) => {
  return pb.send('/backend/v1/checkout', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId, method, cardToken: token, document }),
  })
}
