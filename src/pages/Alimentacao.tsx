import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Refeicao,
  TipoRefeicao,
  Micronutriente,
  TIPO_REFEICAO_LABEL,
  ORDEM_REFEICAO,
  getRefeicoes,
  criarRefeicao,
  deletarRefeicao,
} from '@/services/refeicoes'
import { analisarFotoPrato, prepararFotoParaUpload, type AnaliseFoto } from '@/services/nutricaoFoto'
import { UsoIaIndicador } from '@/components/UsoIaIndicador'
import pb from '@/lib/pocketbase/client'
import { comToken } from '@/lib/pocketbase/fileToken'
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
import { UtensilsCrossed, Plus, Trash2, Flame, Camera, Loader2, Sparkles } from 'lucide-react'

const hoje = () => new Date().toISOString().slice(0, 10)
const diaDe = (s: string) => s.split('T')[0].split(' ')[0]
const formatDia = (s: string) => {
  const d = diaDe(s).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : s
}

// Sugere a refeição pelo horário atual (café/almoço/lanche/jantar).
const tipoSugeridoAgora = (): TipoRefeicao => {
  const h = new Date().getHours()
  if (h < 10) return 'cafe_da_manha'
  if (h < 12) return 'lanche_manha'
  if (h < 15) return 'almoco'
  if (h < 18) return 'lanche_tarde'
  if (h < 21) return 'jantar'
  return 'ceia'
}

const CONFIANCA_LABEL: Record<string, string> = { alta: 'alta', media: 'média', baixa: 'baixa' }

export default function Alimentacao({ premium = false }: { premium?: boolean }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [tipo, setTipo] = useState<TipoRefeicao>('cafe_da_manha')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(hoje())
  const [horario, setHorario] = useState('')
  const [calorias, setCalorias] = useState('')

  // --- Análise de prato por foto (IA) ---
  const fileRef = useRef<HTMLInputElement>(null)
  const [analisando, setAnalisando] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [analiseConfianca, setAnaliseConfianca] = useState('media')
  const [analiseObs, setAnaliseObs] = useState('')
  // Campos editáveis do card de confirmação (estimativa é ajustável)
  const [aTipo, setATipo] = useState<TipoRefeicao>('almoco')
  const [aData, setAData] = useState(hoje())
  const [aDescricao, setADescricao] = useState('')
  const [aCalorias, setACalorias] = useState('')
  const [aProteinas, setAProteinas] = useState('')
  const [aCarboidratos, setACarboidratos] = useState('')
  const [aGorduras, setAGorduras] = useState('')
  const [aMicros, setAMicros] = useState<Micronutriente[]>([])
  const [aFotoFile, setAFotoFile] = useState<File | null>(null)
  const [usoRefresh, setUsoRefresh] = useState(0)

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

  // Abre a câmera/galeria. Sem assinatura → leva para os planos.
  const abrirCamera = () => {
    if (!premium) {
      toast({
        title: 'Recurso para assinantes',
        description: 'A análise de prato por foto faz parte dos planos pagos.',
      })
      navigate('/assinaturas')
      return
    }
    fileRef.current?.click()
  }

  const onFotoSelecionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reescolher a mesma foto depois
    if (!file) return
    setAnalisando(true)
    try {
      const r: AnaliseFoto = await analisarFotoPrato(file)
      setADescricao(r.descricao)
      setACalorias(String(r.calorias))
      setAProteinas(String(r.proteinas))
      setACarboidratos(String(r.carboidratos))
      setAGorduras(String(r.gorduras))
      setAMicros(r.micros || [])
      setAFotoFile(file)
      setAnaliseConfianca(r.confianca)
      setAnaliseObs(r.observacao)
      setATipo(tipoSugeridoAgora())
      setAData(hoje())
      setConfirmOpen(true)
    } catch (err: any) {
      toast({
        title: 'Não foi possível analisar',
        description: err?.message || 'Tente uma foto mais nítida do prato.',
        variant: 'destructive',
      })
    } finally {
      setAnalisando(false)
    }
  }

  const confirmarAnalise = async () => {
    if (!user) return
    if (!aDescricao.trim()) {
      toast({ title: 'Atenção', description: 'Descreva a refeição.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const fotoFile = aFotoFile ? await prepararFotoParaUpload(aFotoFile) : undefined
      await criarRefeicao(
        {
          usuario_id: user.id,
          tipo_refeicao: aTipo,
          descricao: aDescricao.trim(),
          data: aData,
          calorias: aCalorias ? parseInt(aCalorias, 10) : undefined,
          proteinas: aProteinas ? parseInt(aProteinas, 10) : undefined,
          carboidratos: aCarboidratos ? parseInt(aCarboidratos, 10) : undefined,
          gorduras: aGorduras ? parseInt(aGorduras, 10) : undefined,
          micros: aMicros.length ? aMicros : undefined,
        },
        fotoFile,
      )
      toast({ title: 'Adicionado ao diário!', description: 'Refeição registrada com a estimativa.' })
      setConfirmOpen(false)
      setAFotoFile(null)
      setAMicros([])
      setUsoRefresh((n) => n + 1)
      fetch()
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a refeição.', variant: 'destructive' })
    } finally {
      setSaving(false)
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

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFotoSelecionada}
          />
          <Button variant="secondary" onClick={abrirCamera} disabled={analisando}>
            {analisando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" /> Analisar prato (foto)
              </>
            )}
          </Button>

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
      </div>

      <UsoIaIndicador tipo="fotos" refreshKey={usoRefresh} />

      {/* Card de confirmação da análise por foto (estimativa editável) */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Estimativa do prato
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <p className="text-xs text-muted-foreground">
              Estimativa por foto (confiança {CONFIANCA_LABEL[analiseConfianca] || 'média'}). Os valores são
              aproximados — ajuste se precisar antes de salvar.
            </p>
            <div className="space-y-2">
              <Label>Alimentos identificados</Label>
              <Textarea value={aDescricao} onChange={(e) => setADescricao(e.target.value)} rows={3} />
            </div>
            {analiseObs ? <p className="text-xs text-muted-foreground -mt-2">{analiseObs}</p> : null}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Refeição</Label>
                <Select value={aTipo} onValueChange={(v) => setATipo(v as TipoRefeicao)}>
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
                <Label>Data</Label>
                <Input type="date" value={aData} onChange={(e) => setAData(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Kcal</Label>
                <Input type="number" min={0} value={aCalorias} onChange={(e) => setACalorias(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Prot. (g)</Label>
                <Input type="number" min={0} value={aProteinas} onChange={(e) => setAProteinas(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Carb. (g)</Label>
                <Input
                  type="number"
                  min={0}
                  value={aCarboidratos}
                  onChange={(e) => setACarboidratos(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Gord. (g)</Label>
                <Input type="number" min={0} value={aGorduras} onChange={(e) => setAGorduras(e.target.value)} />
              </div>
            </div>
            {aMicros.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Micronutrientes estimados</Label>
                <div className="flex flex-wrap gap-1.5">
                  {aMicros.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {m.nome}: {m.quantidade}
                      {m.unidade}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAnalise} disabled={saving}>
              {saving ? 'Salvando...' : 'Adicionar ao diário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <div className="flex items-start gap-3 min-w-0">
                          {r.foto ? (
                            <img
                              src={comToken(pb.files.getURL(r, r.foto, { thumb: '100x100' }))}
                              alt="Foto do prato"
                              loading="lazy"
                              className="h-16 w-16 rounded-md object-cover border border-border shrink-0"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="font-medium">
                              {TIPO_REFEICAO_LABEL[r.tipo_refeicao]}
                              {r.horario ? (
                                <span className="text-muted-foreground font-normal"> · {r.horario}</span>
                              ) : null}
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {r.descricao}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                              {r.calorias ? <span>{r.calorias} kcal</span> : null}
                              {r.proteinas ? <span>P {r.proteinas}g</span> : null}
                              {r.carboidratos ? <span>C {r.carboidratos}g</span> : null}
                              {r.gorduras ? <span>G {r.gorduras}g</span> : null}
                            </div>
                            {r.micros && r.micros.length > 0 ? (
                              <p className="text-xs text-muted-foreground/80 mt-1">
                                {r.micros.map((m) => `${m.nome} ${m.quantidade}${m.unidade}`).join(' · ')}
                              </p>
                            ) : null}
                          </div>
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
