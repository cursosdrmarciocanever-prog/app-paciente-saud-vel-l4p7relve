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
import { CreditCard, LogOut, Check, Star } from 'lucide-react'

export default function PaymentPending() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSimulatePayment = async () => {
    if (!user) return
    setLoading(true)
    try {
      const updatedUser = await pb.collection('users').update(user.id, { is_paid: true })
      pb.authStore.save(pb.authStore.token, updatedUser)
      toast.success('Assinatura confirmada! Bem-vindo(a) ao premium.')
      window.location.href = '/'
    } catch (error) {
      toast.error('Erro ao processar assinatura.')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'Acompanhamento médico personalizado',
    'Upload ilimitado de relatórios de bioimpedância',
    'Galeria de fotos de evolução',
    'Dashboard unificado de saúde e metas',
    'Acesso à biblioteca de conteúdos exclusivos',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="w-48 h-auto bg-primary/5 p-4 rounded-xl flex items-center justify-center border border-primary/10">
            <img src={logoImg} alt="Clínica Canever" className="w-full object-contain" />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Desbloqueie seu <span className="text-primary">Potencial Máximo</span>
            </h1>
            <p className="text-lg text-slate-600">
              Olá, {user?.name || 'paciente'}! Assine o plano Premium da Clínica Canever e tenha
              acesso a todas as ferramentas para acompanhar sua evolução.
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="space-y-2 text-center pb-8 pt-8">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Plano Premium</CardTitle>
            <CardDescription className="text-base">Acesso completo à plataforma</CardDescription>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-slate-900">R$ 99</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleSimulatePayment}
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {loading ? 'Processando...' : 'Assinar Agora'}
            </Button>
            <p className="text-xs text-center text-slate-500">
              Pagamento seguro simulado para demonstração. Cancelamento a qualquer momento.
            </p>
          </CardContent>
          <CardFooter className="justify-center pb-6 border-t pt-6 bg-slate-50">
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-muted-foreground hover:text-slate-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
