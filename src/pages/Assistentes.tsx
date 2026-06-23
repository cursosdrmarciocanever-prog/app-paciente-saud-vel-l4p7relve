import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Lock, Loader2, FlaskConical, Stethoscope, Apple } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getAssinaturas } from '@/services/assinaturas'
import { criarDieta } from '@/services/dietas'
import { UsoIaIndicador } from '@/components/UsoIaIndicador'
import SuporteChat from './SuporteChat'

export default function Assistentes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [temAssinatura, setTemAssinatura] = useState<boolean | null>(null)

  useEffect(() => {
    getAssinaturas()
      .then((a) => setTemAssinatura(a.some((x) => ['ativo', 'active', 'ativa'].includes(x.status))))
      .catch(() => setTemAssinatura(false))
  }, [])

  const salvarDieta = async (conteudo: string) => {
    if (!user?.id) return
    try {
      await criarDieta({
        usuario_id: user.id,
        titulo: `Plano alimentar — ${new Date().toLocaleDateString('pt-BR')}`,
        conteudo,
        origem: 'assistente',
      })
      toast({ title: 'Dieta salva', description: 'Disponível em Nutrição → Dietas.' })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    }
  }

  if (temAssinatura === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!temAssinatura) {
    return (
      <div className="space-y-6">
        <Cabecalho />
        <Card>
          <CardContent className="flex flex-col items-center text-center gap-4 py-12 px-6">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Assistentes especializados exclusivos para assinantes
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Converse com os assistentes de Nutrição, Exames e Médico, na linha da medicina
                funcional integrativa. Disponível no plano pago.
              </p>
            </div>
            <Button onClick={() => navigate('/assinaturas')}>Conhecer os planos</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Cabecalho />
      <UsoIaIndicador tipo="mensagens" />
      <Tabs defaultValue="nutricional" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="nutricional" className="gap-1.5">
            <Apple className="h-4 w-4" /> Nutrição
          </TabsTrigger>
          <TabsTrigger value="exames" className="gap-1.5">
            <FlaskConical className="h-4 w-4" /> Exames
          </TabsTrigger>
          <TabsTrigger value="medico" className="gap-1.5">
            <Stethoscope className="h-4 w-4" /> Médico
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nutricional" className="mt-4">
          <SuporteChat agente="nutricional" embedded onSaveDieta={salvarDieta} />
        </TabsContent>
        <TabsContent value="exames" className="mt-4">
          <SuporteChat agente="exames" embedded />
        </TabsContent>
        <TabsContent value="medico" className="mt-4">
          <SuporteChat agente="medico" embedded />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Cabecalho() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
        <Sparkles className="h-7 w-7 text-primary" /> Assistentes
      </h1>
      <p className="text-muted-foreground">
        Converse com nossos assistentes especializados em Nutrição, Exames e questões médicas.
      </p>
    </div>
  )
}
