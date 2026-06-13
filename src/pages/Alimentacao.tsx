import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Refeicao,
  TipoRefeicao,
  TIPO_REFEICAO_LABEL,
  ORDEM_REFEICAO,
  getRefeicoes,
  criarRefeicao,
  deletarRefeicao,
} from '@/services/refeicoes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { UtensilsCrossed, Plus, Trash2, Flame } from 'lucide-react'

const hoje = () => new Date().toISOString().slice(0, 10)
const diaDe = (s: string) => s.split('T')[0].split(' ')[0]
const formatDia = (s: string) => {
  const d = diaDe(s).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : s
}

export default function Alimentacao() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tipo, setTipo] = useState<TipoRefeicao>('cafe_da_manha')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(hoje())
  const [horario, setHorario] = useState('')
  const [calorias, setCalorias] = useState('')

  const fetch = async () => {
    if (!user) return
    try {
      setRefeicoes(await getRefeicoes(user.id))
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível carregar o diário.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useRealtime('refeicoes', () => fetch())

  // Agrupa por dia e ordena as refeições do dia cronologicamente
  const porDia = useMemo(() => {
    const grupos: Record<string, Refeicao[]> = {}
    for (const r of refeicoes) {
      const dia = diaDe(r.data)
      ;(grupos[dia] ||= []).push(r)
    }
    const dias = Object.keys(grupos).sort((a, b) => (a < b ? 1 : -1))
    return dias.map((dia) => ({
      dia,
      itens: grupos[dia].sort(
        (a, b) => ORDEM_REFEICAO.indexOf(a.tipo_refeicao) - ORDEM_REFEICAO.indexOf(b.tipo_refeicao),
      ),
    }))
  }, [refeicoes])

  const handleSalvar = async () => {
    if (!user) return
    if (!descricao.trim()) {
      toast({ title: 'Atenção', description: 'Descreva a refeição.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await criarRefeicao({
        usuario_id: user.id,
        tipo_refeicao: tipo,
        descricao: descricao.trim(),
        data,
        horario: horario || undefined,
        calorias: calorias ? parseInt(calorias, 10) : undefined,
      })
      toast({ title: 'Registrado!', description: 'Refeição adicionada ao diário.' })
      setOpen(false)
      setDescricao('')
      setHorario('')
      setCalorias('')
      setTipo('cafe_da_manha')
      setData(hoje())
      fetch()
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a refeição.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleExcluir = async (id: string) => {
    try {
      await deletarRefeicao(id)
      toast({ title: 'Removido', description: 'Refeição excluída.' })
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
            <UtensilsCrossed className="h-7 w-7 text-primary" /> Diário Alimentar
          </h1>
          <p className="text-muted-foreground">Registre suas refeições ao longo do dia.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adicionar refeição
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova refeição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Refeição</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRefeicao)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDEM_REFEICAO.map((t) => (
                        <SelectItem key={t} value={t}>
                          {TIPO_REFEICAO_LABEL[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário (opcional)</Label>
                  <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>O que você comeu?</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: 2 ovos mexidos, 1 fatia de pão integral, café sem açúcar"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Calorias (opcional)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={calorias}
                    onChange={(e) => setCalorias(e.target.value)}
                    placeholder="Ex: 350"
                  />
                </div>
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

      {loading ? (
        <p className="text-muted-foreground py-8 text-center">Carregando...</p>
      ) : porDia.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Seu diário está vazio. Adicione sua primeira refeição.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {porDia.map(({ dia, itens }) => {
            const totalCal = itens.reduce((s, r) => s + (r.calorias || 0), 0)
            return (
              <Card key={dia}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">{formatDia(dia)}</CardTitle>
                  {totalCal > 0 && (
                    <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                      <Flame className="h-4 w-4" /> {totalCal} kcal
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {itens.map((r) => (
                      <li key={r.id} className="flex items-start justify-between py-3 gap-3">
                        <div>
                          <p className="font-medium">
                            {TIPO_REFEICAO_LABEL[r.tipo_refeicao]}
                            {r.horario ? (
                              <span className="text-muted-foreground font-normal"> · {r.horario}</span>
                            ) : null}
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {r.descricao}
                          </p>
                          {r.calorias ? (
                            <p className="text-xs text-muted-foreground mt-1">{r.calorias} kcal</p>
                          ) : null}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluir(r.id)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
