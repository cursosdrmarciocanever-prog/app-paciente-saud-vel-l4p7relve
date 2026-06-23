import { useEffect, useState } from 'react'
import {
  listarLimites,
  salvarLimite,
  criarLimite,
  excluirLimite,
  type LimitePlano,
} from '@/services/admin-limites'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Save, Trash2, Gauge } from 'lucide-react'

export default function Limites() {
  const { toast } = useToast()
  const [linhas, setLinhas] = useState<LimitePlano[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState<string | null>(null)

  const [novoPlano, setNovoPlano] = useState('')
  const [novoMsgs, setNovoMsgs] = useState('150')
  const [novoFotos, setNovoFotos] = useState('60')
  const [criando, setCriando] = useState(false)

  const carregar = async () => {
    try {
      setLinhas(await listarLimites())
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível carregar os limites.', variant: 'destructive' })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const editar = (id: string, campo: 'limite_mensagens' | 'limite_fotos', valor: string) => {
    const n = parseInt(valor, 10)
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, [campo]: isNaN(n) ? 0 : n } : l)))
  }

  const salvar = async (l: LimitePlano) => {
    setSalvandoId(l.id)
    try {
      await salvarLimite(l.id, {
        limite_mensagens: l.limite_mensagens,
        limite_fotos: l.limite_fotos,
      })
      toast({ title: 'Salvo', description: `Limites do plano "${l.plano}" atualizados.` })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    } finally {
      setSalvandoId(null)
    }
  }

  const excluir = async (l: LimitePlano) => {
    if (l.plano === 'default') {
      toast({
        title: 'Não permitido',
        description: 'O plano "default" é o padrão de segurança e não pode ser excluído.',
        variant: 'destructive',
      })
      return
    }
    if (!confirm(`Excluir os limites do plano "${l.plano}"?`)) return
    try {
      await excluirLimite(l.id)
      setLinhas((prev) => prev.filter((x) => x.id !== l.id))
      toast({ title: 'Excluído' })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
    }
  }

  const criar = async () => {
    const plano = novoPlano.trim()
    if (!plano) {
      toast({ title: 'Atenção', description: 'Informe o nome do plano.', variant: 'destructive' })
      return
    }
    setCriando(true)
    try {
      await criarLimite({
        plano,
        limite_mensagens: parseInt(novoMsgs, 10) || 0,
        limite_fotos: parseInt(novoFotos, 10) || 0,
      })
      setNovoPlano('')
      setNovoMsgs('150')
      setNovoFotos('60')
      toast({ title: 'Plano adicionado', description: `Limites de "${plano}" criados.` })
      carregar()
    } catch (_) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar (o nome do plano já existe?).',
        variant: 'destructive',
      })
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Gauge className="h-7 w-7 text-primary" /> Limites de IA
        </h1>
        <p className="text-muted-foreground">
          Limites mensais por plano (recursos pagos). 0 = ilimitado. O plano{' '}
          <strong>default</strong> vale para qualquer assinatura sem linha própria.
        </p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {linhas.map((l) => (
            <Card key={l.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg capitalize">{l.plano}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Mensagens com especialistas / mês</Label>
                    <Input
                      type="number"
                      min={0}
                      value={l.limite_mensagens}
                      onChange={(e) => editar(l.id, 'limite_mensagens', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Análises de foto / mês</Label>
                    <Input
                      type="number"
                      min={0}
                      value={l.limite_fotos}
                      onChange={(e) => editar(l.id, 'limite_fotos', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  {l.plano !== 'default' && (
                    <Button variant="outline" onClick={() => excluir(l)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-1.5" /> Excluir
                    </Button>
                  )}
                  <Button onClick={() => salvar(l)} disabled={salvandoId === l.id}>
                    {salvandoId === l.id ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Adicionar plano</CardTitle>
              <CardDescription>
                Crie uma linha com o nome EXATO do plano da assinatura (ex.: "Premium",
                "Intermediário").
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome do plano</Label>
                  <Input
                    value={novoPlano}
                    onChange={(e) => setNovoPlano(e.target.value)}
                    placeholder="Ex.: Premium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mensagens / mês</Label>
                  <Input
                    type="number"
                    min={0}
                    value={novoMsgs}
                    onChange={(e) => setNovoMsgs(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fotos / mês</Label>
                  <Input
                    type="number"
                    min={0}
                    value={novoFotos}
                    onChange={(e) => setNovoFotos(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={criar} disabled={criando}>
                  {criando ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  Adicionar plano
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
