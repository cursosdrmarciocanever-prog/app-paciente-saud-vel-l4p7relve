import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PaymentPending() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubscribe = async () => {
    if (!user) return
    try {
      await pb.collection('users').update(user.id, { is_paid: true })
      toast.success('Assinatura Premium ativada com sucesso!')
      navigate('/')
    } catch (e) {
      toast.error('Erro ao ativar assinatura.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-2 mt-8">
        <h1 className="text-3xl font-bold tracking-tight">Escolha seu Plano</h1>
        <p className="text-muted-foreground text-lg">
          Desbloqueie todo o potencial do seu acompanhamento.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
        <Card className="flex flex-col border-border/50 bg-background shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">Plano Free</CardTitle>
            <CardDescription>O essencial para começar.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="text-3xl font-bold mb-6">Grátis</div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-5 h-5 text-green-500" /> Acesso ao Dashboard
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-5 h-5 text-green-500" /> Agendamento de Consultas
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-5 h-5 text-muted-foreground/30" /> Acesso à Biblioteca de Vídeos
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-5 h-5 text-muted-foreground/30" /> Upload de Bioimpedância
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-5 h-5 text-muted-foreground/30" /> Galeria de Fotos de Evolução
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={!user?.is_paid}>
              {user?.is_paid ? 'Reverter para Free' : 'Plano Atual'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-primary shadow-lg relative overflow-hidden transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg tracking-wider">
            RECOMENDADO
          </div>
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-2xl text-primary">Plano Premium</CardTitle>
            <CardDescription>Acompanhamento completo e ilimitado.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 pt-6">
            <div className="text-4xl font-bold mb-6">
              R$ 149,90<span className="text-sm font-normal text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-5 h-5 text-primary" /> Acesso ao Dashboard
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-5 h-5 text-primary" /> Agendamento de Consultas prioritário
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-5 h-5 text-primary" /> Acesso total à Biblioteca de Vídeos
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-primary">
                <Check className="w-5 h-5 text-primary" /> Upload Ilimitado de Bioimpedância
              </li>
              <li className="flex items-center gap-2 text-sm font-bold text-primary">
                <Check className="w-5 h-5 text-primary" /> Galeria de Fotos de Evolução
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pb-6">
            {user?.is_paid ? (
              <Button className="w-full text-lg h-12" disabled>
                Premium Ativo
              </Button>
            ) : (
              <Button
                className="w-full text-lg h-12 shadow-md hover:shadow-lg transition-shadow"
                onClick={handleSubscribe}
              >
                Assinar Agora
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
