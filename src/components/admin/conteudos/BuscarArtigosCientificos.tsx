import { useState } from 'react'
import {
  buscarArtigosCientificos,
  createArtigo,
  type ArtigoCientifico,
  type Categoria,
} from '@/services/conteudo'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Loader2,
  ExternalLink,
  ChevronDown,
  Check,
  FlaskConical,
} from 'lucide-react'

interface Props {
  categorias: Categoria[]
}

export function BuscarArtigosCientificos({ categorias }: Props) {
  const { toast } = useToast()
  const [q, setQ] = useState('')
  const [fonte, setFonte] = useState<'europepmc' | 'crossref'>('europepmc')
  const [categoriaId, setCategoriaId] = useState<string>(categorias[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [resultados, setResultados] = useState<ArtigoCientifico[]>([])
  const [resumoAberto, setResumoAberto] = useState<Record<number, boolean>>({})
  const [publicados, setPublicados] = useState<Record<number, boolean>>({})
  const [publicandoIdx, setPublicandoIdx] = useState<number | null>(null)
  const [buscou, setBuscou] = useState(false)

  const buscar = async () => {
    if (!q.trim()) return
    setLoading(true)
    setPublicados({})
    setResumoAberto({})
    try {
      const r = await buscarArtigosCientificos(q.trim(), fonte)
      setResultados(r)
      setBuscou(true)
    } catch (_) {
      toast({ title: 'Erro', description: 'Falha na busca. Tente novamente.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const publicar = async (art: ArtigoCientifico, idx: number) => {
    if (!categoriaId) {
      toast({ title: 'Selecione uma categoria', variant: 'destructive' })
      return
    }
    setPublicandoIdx(idx)
    try {
      const resumo = art.resumo || 'Artigo científico.'
      const conteudo =
        resumo +
        (art.fonte ? `\n\nPublicado em: ${art.fonte}${art.ano ? ` (${art.ano})` : ''}` : '') +
        (art.link ? `\n\nFonte: ${art.link}` : '') +
        (art.doi ? `\nDOI: ${art.doi}` : '')
      await createArtigo({
        titulo: art.titulo.slice(0, 250),
        descricao: (resumo.slice(0, 280) || art.titulo).trim(),
        conteudo,
        categoria_id: categoriaId,
        autor: art.autores || 'Equipe Clínica Canever',
        imagem_url: '',
        publicado: true,
        visualizacoes: 0,
      } as any)
      setPublicados((p) => ({ ...p, [idx]: true }))
      toast({ title: 'Artigo publicado', description: 'Já visível para os pacientes na Biblioteca.' })
    } catch (err: any) {
      toast({
        title: 'Erro ao publicar',
        description: err?.message || 'Não foi possível publicar.',
        variant: 'destructive',
      })
    } finally {
      setPublicandoIdx(null)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FlaskConical className="h-4 w-4 text-primary" />
            Busque artigos científicos e publique para os pacientes na Biblioteca de Saúde.
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                placeholder="Ex: vitamin D supplementation, intermittent fasting..."
                className="pl-9"
              />
            </div>
            <Select value={fonte} onValueChange={(v) => setFonte(v as any)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="europepmc">Europe PMC / PubMed</SelectItem>
                <SelectItem value="crossref">CrossRef</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={buscar} disabled={loading || !q.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-1.5">Buscar</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Publicar na categoria:</span>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger className="w-56 h-8">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id!}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-900 font-medium">
              ⚠️ Somente dados reais. Os resultados vêm direto das bases científicas (PubMed/Europe
              PMC e CrossRef) — nada é gerado ou inventado. Publique apenas o que conferir na fonte
              original.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Pesquisar também em:</span>
            {[
              { nome: 'PubMed', url: (t: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(t)}` },
              { nome: 'Consensus', url: (t: string) => `https://consensus.app/search/?q=${encodeURIComponent(t)}` },
              { nome: 'STORM (Stanford)', url: () => 'https://storm.genie.stanford.edu/' },
              { nome: 'Napkin', url: () => 'https://app.napkin.ai/' },
            ].map((f) => (
              <a
                key={f.nome}
                href={f.url(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline border border-border rounded-full px-2.5 py-1"
              >
                <ExternalLink className="h-3 w-3" /> {f.nome}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : buscou && resultados.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhum artigo encontrado. Tente outros termos (a busca funciona melhor em inglês).
        </p>
      ) : (
        <div className="space-y-3">
          {resultados.map((art, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{art.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {[art.autores, art.fonte, art.ano].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {publicados[idx] ? (
                      <span className="inline-flex items-center text-sm text-green-700 font-medium">
                        <Check className="h-4 w-4 mr-1" /> Publicado
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => publicar(art, idx)} disabled={publicandoIdx === idx}>
                        {publicandoIdx === idx ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Publicar'
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {art.resumo && (
                  <div className="mt-2">
                    <button
                      onClick={() => setResumoAberto((p) => ({ ...p, [idx]: !p[idx] }))}
                      className="text-xs font-medium text-primary flex items-center gap-1"
                    >
                      Resumo
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${resumoAberto[idx] ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {resumoAberto[idx] && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{art.resumo}</p>
                    )}
                  </div>
                )}

                {art.link && (
                  <a
                    href={art.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir artigo original
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
