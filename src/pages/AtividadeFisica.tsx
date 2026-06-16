import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  AtividadeFisica as Atividade,
  TipoAtividade,
  TIPO_ATIVIDADE_LABEL,
  getAtividades,
  criarAtividade,
  deletarAtividade,
} from '@/services/atividades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Activity, Plus, Trash2, Clock, Flame, Watch, Loader2 } from 'lucide-react'
import { healthDisponivel, sincronizarAppleWatch } from '@/services/appleHealth'

const hoje = () => new Date().toISOString().slice(0, 10)

const formatData = (s: string) => {
  const d = s.split('T')[0].split(' ')[0].split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : s
}

export default function AtividadeFisica() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tipo, setTipo] = useState<TipoAtividade>('caminhada')
  const [duracao, setDuracao] = useState('')
  const [data, setData] = useState(hoje())
  const [calorias, setCalorias] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const fetch = async () => {
    if (!user) return
    try {
      setAtividades(await getAtividades(user.id))
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível carregar as atividades.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useRealtime('atividades_fisicas', () => fetch())

  // Apple Watch (só no app nativo iOS)
  const [watchDisponivel, setWatchDisponivel] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)

  useEffect(() => {
    healthDisponivel().then(setWatchDisponivel)
  }, [])

  const handleSincronizarWatch = async () => {
    if (!user) return
    setSincronizando(true)
    try {
      const r = await sincronizarAppleWatch(user.id)
      toast({
        title: 'Apple Watch sincronizado',
        description:
          r.importados > 0
            ? `${r.importados} novo(s) treino(s) importado(s).`
            : 'Nenhum treino novo para importar.',
      })
      fetch()
    } catch (_) {
      toast({
        title: 'Erro ao sincronizar',
        description: 'Verifique as permissões de Saúde no iPhone e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSincronizando(false)
    }
  }

  const resumo = useMemo(() => {
    const totalMin = atividades.reduce((s, a) => s + (a.duracao_minutos || 0), 0)
    const totalCal = atividades.reduce((s, a) => s + (a.calorias || 0), 0)
    return { qtd: atividades.length, totalMin, totalCal }
  }, [atividades])

  const handleSalvar = async () => {
    if (!user) return
    const dur = parseInt(duracao, 10)
    if (!dur || dur < 1) {
      toast({ title: 'Atenção', description: 'Informe a duração em minutos.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await criarAtividade({
        usuario_id: user.id,
        tipo,
        duracao_minutos: dur,
        data,
        calorias: calorias ? parseInt(calorias, 10) : undefined,
        observacoes: observacoes || undefined,
      })
      toast({ title: 'Registrado!', description: 'Atividade adicionada com sucesso.' })
      setOpen(false)
      setDuracao('')
      setCalorias('')
      setObservacoes('')
      setTipo('caminhada')
      setData(hoje())
      fetch()
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a atividade.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleExcluir = async (id: string) => {
    try {
      await deletarAtividade(id)
      toast({ title: 'Removido', description: 'Atividade excluída.' })
      fetch()
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" /> Atividade Física
          </h1>
          <p className="text-muted-foreground">Registre seus treinos e acompanhe sua evolução.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Registrar atividade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova atividade física</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoAtividade)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TIPO_ATIVIDADE_LABEL) as TipoAtividade[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_ATIVIDADE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Duração (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Calorias (opcional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={calorias}
                  onChange={(e) => setCalorias(e.target.value)}
                  placeholder="Ex: 300"
                />
              </div>
              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Input
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Como foi o treino?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {watchDisponivel && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <Watch className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-semibold">Apple Watch</p>
                <p className="text-sm text-muted-foreground">
                  Importe seus treinos do Apple Watch automaticamente.
                </p>
              </div>
            </div>
            <Button onClick={handleSincronizarWatch} disabled={sincronizando}>
              {sincronizando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Watch className="mr-2 h-4 w-4" />
              )}
              {sincronizando ? 'Sincronizando...' : 'Sincronizar Apple Watch'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{resumo.qtd}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Minutos totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{resumo.totalMin}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{resumo.totalCal}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-8 text-center">Carregando...</p>
          ) : atividades.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Nenhuma atividade registrada ainda. Clique em "Registrar atividade".
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {atividades.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{TIPO_ATIVIDADE_LABEL[a.tipo] || a.tipo}</p>
                    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{formatData(a.data)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {a.duracao_minutos} min
                      </span>
                      {a.calorias ? (
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5" /> {a.calorias} kcal
                        </span>
                      ) : null}
                    </p>
                    {a.observacoes ? (
                      <p className="text-sm text-muted-foreground mt-1">{a.observacoes}</p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExcluir(a.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
