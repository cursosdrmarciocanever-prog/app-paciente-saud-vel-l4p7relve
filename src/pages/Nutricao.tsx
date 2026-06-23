import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Apple, Sparkles, Lock, Loader2, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getAssinaturas } from '@/services/assinaturas'
import { getDietas, criarDieta, excluirDieta, type Dieta } from '@/services/dietas'
import { DietasView } from '@/components/nutricao/DietasView'
import Alimentacao from './Alimentacao'
import SuporteChat from './SuporteChat'

export default function Nutricao() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [temAssinatura, setTemAssinatura] = useState<boolean | null>(null)
  const [tab, setTab] = useState('diario')

  const [dietas, setDietas] = useState<Dieta[]>([])
  const [carregandoDietas, setCarregandoDietas] = useState(true)

  useEffect(() => {
    getAssinaturas()
      .then((assinaturas) =>
        setTemAssinatura(assinaturas.some((a) => ['ativo', 'active', 'ativa'].includes(a.status))),
      )
      .catch(() => setTemAssinatura(false))
  }, [])

  const carregarDietas = useCallback(async () => {
    if (!user?.id) return
    try {
      setDietas(await getDietas(user.id))
    } catch (_) {
      /* silencioso */
    } finally {
      setCarregandoDietas(false)
    }
  }, [user?.id])

  useEffect(() => {
    carregarDietas()
  }, [carregarDietas])

  const salvarDieta = async (conteudo: string) => {
    if (!user?.id) return
    try {
      const agora = new Date()
      const titulo = `Plano alimentar — ${agora.toLocaleDateString('pt-BR')}`
      await criarDieta({ usuario_id: user.id, titulo, conteudo, origem: 'assistente' })
      await carregarDietas()
      setTab('dietas')
      toast({ title: 'Dieta salva', description: 'Disponível na aba Dietas.' })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a dieta.', variant: 'destructive' })
    }
  }

  const removerDieta = async (id: string) => {
    try {
      await excluirDieta(id)
      setDietas((prev) => prev.filter((d) => d.id !== id))
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Apple className="h-7 w-7 text-primary" /> Nutrição
        </h1>
        <p className="text-muted-foreground">
          Acompanhe sua alimentação, veja suas dietas e converse com o assistente nutricional.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="diario">Diário</TabsTrigger>
          <TabsTrigger value="dietas" className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Dietas
          </TabsTrigger>
          <TabsTrigger value="assistente" className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Assistente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diario" className="mt-6">
          <Alimentacao premium={!!temAssinatura} />
        </TabsContent>

        <TabsContent value="dietas" className="mt-6">
          {carregandoDietas ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <DietasView
              dietas={dietas}
              onExcluir={removerDieta}
              vazio="Você ainda não tem dietas. A equipe da clínica pode criar uma para você, ou monte a sua no Assistente Nutricional (plano pago)."
            />
          )}
        </TabsContent>

        <TabsContent value="assistente" className="mt-6">
          {temAssinatura === null ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : temAssinatura ? (
            <SuporteChat agente="nutricional" embedded onSaveDieta={salvarDieta} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center text-center gap-4 py-12 px-6">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Lock className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Assistente Nutricional exclusivo para assinantes
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Monte planos alimentares personalizados com nosso assistente. As dietas criadas
                    pela equipe da clínica continuam disponíveis para você na aba Dietas.
                  </p>
                </div>
                <Button onClick={() => navigate('/assinaturas')}>Conhecer os planos</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
