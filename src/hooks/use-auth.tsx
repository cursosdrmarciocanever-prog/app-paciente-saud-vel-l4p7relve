import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import type { AuthModel } from 'pocketbase'

interface AuthContextType {
  user: AuthModel | null
  signUp: (data: any) => Promise<{ error: any }>
  signIn: (data: any) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthModel | null>(
    pb.authStore.isValid ? pb.authStore.record : null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
          if (isMounted) {
            setUser(pb.authStore.record)
          }
        } catch (error: any) {
          // Only clear auth state if it's a genuine auth error (4xx)
          // If it's a network error (0) or 5xx, keep the current session
          if (error?.status >= 400 && error?.status < 500) {
            pb.authStore.clear()
            if (isMounted) {
              setUser(null)
            }
          }
        }
      }
      if (isMounted) {
        setLoading(false)
      }
    }

    initAuth()

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (isMounted) {
        setUser(pb.authStore.isValid ? record : null)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const signUp = async (data: any) => {
    try {
      await pb.collection('users').create(data)
      const authData = await pb.collection('users').authWithPassword(data.email, data.password)
      setUser(authData.record)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (data: any) => {
    try {
      const authData = await pb.collection('users').authWithPassword(data.email, data.password)
      setUser(authData.record)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
