import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Loader2, Stethoscope, Video, FileText, MessageCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function Assinaturas() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const handleSelectPlan = async (planName: string) => {
    if (!user) return
    setIsLoading(planName)
    try {
      const today = new Date()
      const nextMonth = new Date(today)
      nextMonth.setDate(nextMonth.getDate() + 30)

      const existing = await pb.collection('assinaturas').getFullList({
        filter: `usuario_id = "${user.id}"`,
      })

      if (existing.length > 0) {
        await pb.collection('assinaturas').update(existing[0].id, {
          plano: planName,
          status: 'ativa',
          data_inicio: today.toISOString(),
          data_renovacao: nextMonth.toISOString(),
        })
      } else {
        await pb.collection('assinaturas').create({
          usuario_id: user.id,
          plano: planName,
          status: 'ativa',
          data_inicio: today.toISOString(),
          data_renovacao: nextMonth.toISOString(),
        })
      }

      toast({
        title: 'Assinatura confirmada!',
        description: `Você agora possui o ${planName}.`,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar sua assinatura. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up flex flex-col items-center gap-12 px-4 py-8">
      <div className="w-full flex justify-between items-center text-foreground">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Escolha seu Plano</h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground">
            Acesso à biblioteca de saúde e conteúdos premium
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Sair</span>
        </Button>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="relative flex flex-col bg-card border border-border/50 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-bold">Plano Essencial</CardTitle>
            <CardDescription className="text-base mt-2">Acesso básico à plataforma</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-4">
            <div className="mb-6 text-center">
              <span className="text-4xl font-bold">R$ 49,90</span>
              <span className="text-muted-foreground ml-2">/ mês</span>
            </div>
            <ul className="space-y-4 flex-1 mt-4">
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Acesso a artigos básicos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Vídeos introdutórios</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              onClick={() => handleSelectPlan('Plano Essencial')}
              disabled={isLoading !== null}
              variant="outline"
              className="w-full h-12 text-lg font-medium"
            >
              {isLoading === 'Plano Essencial' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                'Escolher Essencial'
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative flex flex-col bg-card border-2 border-primary transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
            <Star className="h-4 w-4 fill-current" /> Recomendado
          </div>
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-2xl font-bold">Plano Premium</CardTitle>
            <CardDescription className="text-base mt-2">Acesso total e ilimitado</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-4">
            <div className="mb-6 text-center">
              <span className="text-4xl font-bold">R$ 99,90</span>
              <span className="text-muted-foreground ml-2">/ mês</span>
            </div>
            <ul className="space-y-4 flex-1 mt-4">
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Todos os artigos exclusivos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Acervo completo de vídeos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Prioridade de agendamento</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Suporte prioritário</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              onClick={() => handleSelectPlan('Plano Premium')}
              disabled={isLoading !== null}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-medium border-0"
            >
              {isLoading === 'Plano Premium' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                'Escolher Premium'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
