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

export const getSubscription = async (id: string) => {
  try {
    return await pb.collection('subscriptions').getOne<SubscriptionRecord>(id)
  } catch (error) {
    return null
  }
}

export const getUserSubscriptions = async (userId: string) => {
  return pb.collection('subscriptions').getFullList<SubscriptionRecord>({
    filter: `user = "${userId}"`,
    sort: '-created',
  })
}

export const createPendingSubscription = async (userId: string, plan: string, price: number) => {
  return pb.collection('subscriptions').create<SubscriptionRecord>({
    user: userId,
    plan,
    status: 'pending_payment',
    monthly_price: price,
  })
}

export const cancelSubscription = async (id: string) => {
  return pb.collection('subscriptions').update<SubscriptionRecord>(id, {
    status: 'canceled',
  })
}
