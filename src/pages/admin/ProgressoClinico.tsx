import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { Textarea } from '@/components/ui/textarea'
import {
  buscarPacientes,
  getFotosDoPaciente,
  getExamesDoPaciente,
  getBiosDoPaciente,
  fileUrl,
  type PacienteResumo,
} from '@/services/admin-progresso'
import { getDietas, criarDieta, excluirDieta, type Dieta } from '@/services/dietas'
import { DietasView } from '@/components/nutricao/DietasView'
import SuporteChat from '@/pages/SuporteChat'
import {
  Search,
  FileText,
  Image as ImageIcon,
  Activity,
  Eye,
  Download,
  Loader2,
  X,
  Utensils,
  Plus,
  Sparkles,
} from 'lucide-react'

const isPdf = (nome?: string) => !!nome && nome.toLowerCase().endsWith('.pdf')

export default function AdminProgressoClinico() {
  const { toast } = useToast()
  const [termo, setTermo] = useState('')
  const buscaDebounced = useDebounce(termo, 350)
  const [pacientes, setPacientes] = useState<PacienteResumo[]>([])
  const [buscando, setBuscando] = useState(false)
  const [paciente, setPaciente] = useState<PacienteResumo | null>(null)

  const [fotos, setFotos] = useState<any[]>([])
  const [exames, setExames] = useState<any[]>([])
  const [bios, setBios] = useState<any[]>([])
  const [dietas, setDietas] = useState<Dieta[]>([])
  const [carregando, setCarregando] = useState(false)

  // formulário de nova dieta (admin)
  const [novaTitulo, setNovaTitulo] = useState('')
  const [novoConteudo, setNovoConteudo] = useState('')
  const [salvandoDieta, setSalvandoDieta] = useState(false)

  // visualizador (blob para driblar o CSP do PocketBase)
  const [visualizar, setVisualizar] = useState<{ url: string; titulo: string; pdf: boolean } | null>(
    null,
  )
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const objUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let ativo = true
    if (!buscaDebounced.trim()) {
      setPacientes([])
      return
    }
    setBuscando(true)
    buscarPacientes(buscaDebounced)
      .then((r) => ativo && setPacientes(r))
      .catch(() => ativo && setPacientes([]))
      .finally(() => ativo && setBuscando(false))
    return () => {
      ativo = false
    }
  }, [buscaDebounced])

  const selecionar = async (p: PacienteResumo) => {
    setPaciente(p)
    setPacientes([])
    setTermo('')
    setCarregando(true)
    try {
      const [f, e, b, d] = await Promise.all([
        getFotosDoPaciente(p.id),
        getExamesDoPaciente(p.id),
        getBiosDoPaciente(p.id),
        getDietas(p.id),
      ])
      setFotos(f)
      setExames(e)
      setBios(b)
      setDietas(d)
    } catch (_) {
      toast({ title: 'Erro', description: 'Falha ao carregar o progresso do paciente.', variant: 'destructive' })
    } finally {
      setCarregando(false)
    }
  }

  const salvarNovaDieta = async () => {
    if (!paciente || !novaTitulo.trim() || !novoConteudo.trim()) return
    setSalvandoDieta(true)
    try {
      await criarDieta({
        usuario_id: paciente.id,
        titulo: novaTitulo.trim(),
        conteudo: novoConteudo.trim(),
        origem: 'admin',
      })
      setNovaTitulo('')
      setNovoConteudo('')
      setDietas(await getDietas(paciente.id))
      toast({ title: 'Dieta criada', description: 'Já disponível para o paciente.' })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a dieta.', variant: 'destructive' })
    } finally {
      setSalvandoDieta(false)
    }
  }

  const salvarDietaDoAssistente = async (conteudo: string) => {
    if (!paciente) return
    try {
      const titulo = `Plano alimentar — ${new Date().toLocaleDateString('pt-BR')}`
      await criarDieta({ usuario_id: paciente.id, titulo, conteudo, origem: 'admin' })
      setDietas(await getDietas(paciente.id))
      toast({
        title: 'Dieta anexada',
        description: `Salva para ${paciente.name}. Já disponível para o paciente.`,
      })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível anexar a dieta.', variant: 'destructive' })
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

  useEffect(() => {
    if (!visualizar) {
      setBlobUrl(null)
      if (objUrlRef.current) {
        URL.revokeObjectURL(objUrlRef.current)
        objUrlRef.current = null
      }
      return
    }
    let ativo = true
    fetch(visualizar.url)
      .then((r) => r.blob())
      .then((blob) => {
        if (!ativo) return
        const u = URL.createObjectURL(blob)
        objUrlRef.current = u
        setBlobUrl(u)
      })
      .catch(() => ativo && toast({ title: 'Erro', description: 'Não foi possível abrir o arquivo.', variant: 'destructive' }))
    return () => {
      ativo = false
    }
  }, [visualizar, toast])

  const fmtData = (d?: string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')

  const ListaArquivos = ({
    itens,
    campo,
    titulo,
    subtitulo,
    vazio,
  }: {
    itens: any[]
    campo: string
    titulo: (x: any) => string
    subtitulo: (x: any) => string
    vazio: string
  }) => {
    if (itens.length === 0) {
      return <p className="text-sm text-muted-foreground py-8 text-center">{vazio}</p>
    }
    return (
      <div className="space-y-3">
        {itens.map((item) => {
          const nomeArq = item[campo] as string
          return (
            <Card key={item.id} className="flex flex-row items-center justify-between p-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate">{titulo(item)}</h3>
                  <p className="text-xs text-muted-foreground">{subtitulo(item)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setVisualizar({ url: fileUrl(item, campo), titulo: titulo(item), pdf: isPdf(nomeArq) })
                  }
                >
                  <Eye className="w-4 h-4 mr-1" /> Ver
                </Button>
                <a href={fileUrl(item, campo)} download target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Progresso Clínico</h2>
        <p className="text-sm text-slate-500">
          Busque um paciente para ver fotos, exames e bioimpedância em um só lugar.
        </p>
      </div>

      {/* Busca */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF..."
          className="pl-9"
        />
        {(buscando || pacientes.length > 0) && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg max-h-72 overflow-y-auto">
            {buscando && (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Buscando...
              </div>
            )}
            {!buscando &&
              pacientes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selecionar(p)}
                  className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors border-b border-border last:border-0"
                >
                  <span className="font-medium text-foreground block">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.email}
                    {p.cpf ? ` • CPF ${p.cpf}` : ''}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Paciente selecionado */}
      {paciente && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{paciente.name}</p>
              <p className="text-xs text-muted-foreground">
                {paciente.email}
                {paciente.cpf ? ` • CPF ${paciente.cpf}` : ''}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPaciente(null)}>
              Trocar
            </Button>
          </CardContent>
        </Card>
      )}

      {paciente &&
        (carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="fotos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="fotos" className="gap-1.5">
                <ImageIcon className="w-4 h-4" /> Fotos
              </TabsTrigger>
              <TabsTrigger value="exames" className="gap-1.5">
                <FileText className="w-4 h-4" /> Exames
              </TabsTrigger>
              <TabsTrigger value="bio" className="gap-1.5">
                <Activity className="w-4 h-4" /> Bioimpedância
              </TabsTrigger>
              <TabsTrigger value="dietas" className="gap-1.5">
                <Utensils className="w-4 h-4" /> Dietas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fotos" className="mt-4">
              <ListaArquivos
                itens={fotos}
                campo="foto"
                titulo={(x) => x.descricao || 'Foto'}
                subtitulo={(x) => `Enviada em ${fmtData(x.created)}`}
                vazio="Nenhuma foto deste paciente."
              />
            </TabsContent>

            <TabsContent value="exames" className="mt-4">
              <ListaArquivos
                itens={exames}
                campo="arquivo"
                titulo={(x) => x.nome_exame || 'Exame'}
                subtitulo={(x) => `${fmtData(x.data_exame)} • ${x.tipo_exame || 'exame'}`}
                vazio="Nenhum exame deste paciente."
              />
            </TabsContent>

            <TabsContent value="bio" className="mt-4">
              <ListaArquivos
                itens={bios}
                campo="arquivo"
                titulo={() => 'Laudo de Bioimpedância'}
                subtitulo={(x) =>
                  `${fmtData(x.data_medicao)}${x.percentual_gordura ? ` • ${x.percentual_gordura}% gordura` : ''}`
                }
                vazio="Nenhuma bioimpedância deste paciente."
              />
            </TabsContent>

            <TabsContent value="dietas" className="mt-4 space-y-6">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Gerar com o assistente
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Converse com o assistente nutricional. Ao final do plano, clique em
                      “Salvar como dieta” para anexar a <strong>{paciente.name}</strong>.
                    </p>
                  </div>
                  <SuporteChat
                    agente="nutricional"
                    embedded
                    onSaveDieta={salvarDietaDoAssistente}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" /> Ou inclua manualmente
                  </h3>
                  <Input
                    value={novaTitulo}
                    onChange={(e) => setNovaTitulo(e.target.value)}
                    placeholder="Título (ex: Plano de hipertrofia — junho)"
                  />
                  <Textarea
                    value={novoConteudo}
                    onChange={(e) => setNovoConteudo(e.target.value)}
                    placeholder="Cole ou escreva o plano alimentar aqui..."
                    rows={8}
                  />
                  <Button
                    onClick={salvarNovaDieta}
                    disabled={salvandoDieta || !novaTitulo.trim() || !novoConteudo.trim()}
                  >
                    {salvandoDieta ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Salvar dieta
                  </Button>
                </CardContent>
              </Card>

              <DietasView
                dietas={dietas}
                onExcluir={removerDieta}
                vazio="Nenhuma dieta cadastrada para este paciente."
              />
            </TabsContent>
          </Tabs>
        ))}

      {/* Visualizador */}
      {visualizar && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setVisualizar(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="font-medium text-foreground truncate">{visualizar.titulo}</span>
              <Button variant="ghost" size="icon" onClick={() => setVisualizar(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 bg-muted flex items-center justify-center overflow-auto">
              {!blobUrl ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : visualizar.pdf ? (
                <iframe src={blobUrl} title={visualizar.titulo} className="w-full h-full" />
              ) : (
                <img src={blobUrl} alt={visualizar.titulo} className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
