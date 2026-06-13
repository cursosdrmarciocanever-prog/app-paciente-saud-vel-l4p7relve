import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    if (loading || isVerified !== null) return

    if (!user) {
      toast({
        title: 'Acesso Negado',
        description: 'Faça login para continuar',
        variant: 'destructive',
      })
      setIsVerified(false)
      return
    }

    if (user.email === 'admin@canever.com.br' || user.email === 'marciocanever@hotmail.com') {
      setIsVerified(true)
    } else {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página',
        variant: 'destructive',
      })
      setIsVerified(false)
    }
  }, [user, loading, isVerified, toast])

  if (loading || isVerified === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-transparent border-t-[#D4A574]" />
        <p className="text-sm font-medium text-[#4A4A4A]">Verificando permissões...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isVerified) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
