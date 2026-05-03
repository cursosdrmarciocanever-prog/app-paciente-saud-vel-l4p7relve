import pb from '@/lib/pocketbase/client'

export interface SubscriptionRecord {
  id: string
  user: string
  plan: 'entry' | 'intermediate' | 'premium' | 'diamond'
  status: 'active' | 'pending_payment' | 'canceled' | 'suspended'
  start_date: string
  renewal_date: string
  monthly_price: number
}

export const getActiveSubscription = async (userId: string) => {
  try {
    const result = await pb
      .collection('subscriptions')
      .getFirstListItem<SubscriptionRecord>(`user = "${userId}" && status = "active"`, {
        sort: '-created',
      })
    return result
  } catch (error) {
    return null
  }
}
