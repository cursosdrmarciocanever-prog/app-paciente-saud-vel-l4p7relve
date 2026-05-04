import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getActiveSubscription } from '@/services/subscriptions'

export function useEligibility() {
  const { user } = useAuth()
  const [isEligible, setIsEligible] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkEligibility() {
      if (!user) {
        setIsEligible(false)
        setLoading(false)
        return
      }

      if (user.role === 'admin') {
        setIsEligible(true)
        setLoading(false)
        return
      }

      if (!user.is_paid) {
        setIsEligible(false)
        setLoading(false)
        return
      }

      try {
        const sub = await getActiveSubscription(user.id)
        setIsEligible(!!sub)
      } catch (error) {
        setIsEligible(false)
      } finally {
        setLoading(false)
      }
    }

    checkEligibility()
  }, [user])

  return { isEligible, loading, isAdmin: user?.role === 'admin' }
}
