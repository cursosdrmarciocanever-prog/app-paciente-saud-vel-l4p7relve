import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'
import { Lock, CreditCard, LogOut } from 'lucide-react'

export default function PaymentPending() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSimulatePayment = async () => {
    if (!user) return
    setLoading(true)
    try {
      const updatedUser = await pb.collection('users').update(user.id, { is_paid: true })
      pb.authStore.save(pb.authStore.token, updatedUser)
      toast.success('Pagamento confirmado! Acesso liberado.')
      window.location.href = '/'
    } catch (error) {
      toast.error('Erro ao simular pagamento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-4 flex flex-col items-center pt-8">
          <div className="w-48 h-auto bg-primary/5 p-4 rounded-xl flex items-center justify-center border border-primary/10">
            <img src={logoImg} alt="Clínica Canever" className="w-full object-contain" />
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
            <CardDescription className="text-base">
              Olá, {user?.name || 'paciente'}! Seu acesso à plataforma da Clínica Canever requer a
              confirmação da sua assinatura.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-2">
          <div className="bg-muted p-4 rounded-lg text-sm text-center">
            Para continuar acessando seu painel de evolução, planos alimentares e biblioteca de
            conteúdos, por favor, regularize sua situação.
          </div>

          <Button
            onClick={handleSimulatePayment}
            className="w-full h-12 text-base font-semibold"
            disabled={loading}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {loading ? 'Processando...' : 'Simular Pagamento'}
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-8">
          <Button variant="ghost" onClick={signOut} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
