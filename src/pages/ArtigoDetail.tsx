import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getArtigo, updateArtigo } from '@/services/conteudo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Eye, CalendarIcon, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArtigoExpandido } from '@/components/biblioteca/types'

export default function ArtigoDetail() {
  const { id } = useParams<{ id: string }>()
  const [artigo, setArtigo] = useState<ArtigoExpandido | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const viewIncremented = useRef(false)

  useEffect(() => {
    if (!id) return

    const fetchAndIncrement = async () => {
      setLoading(true)
      try {
        const data = await getArtigo(id, { expand: 'categoria_id' })
        const artigoData = data as unknown as ArtigoExpandido
        setArtigo(artigoData)

        if (!viewIncremented.current) {
          viewIncremented.current = true
          const newViews = (artigoData.visualizacoes || 0) + 1
          await updateArtigo(id, { visualizacoes: newViews })
          setArtigo((prev) => (prev ? { ...prev, visualizacoes: newViews } : null))
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o artigo.',
          variant: 'destructive',
        })
        navigate('/biblioteca')
      } finally {
        setLoading(false)
      }
    }

    fetchAndIncrement()
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6 space-y-6 w-full animate-fade-in">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="w-full aspect-[21/9] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    )
  }

  if (!artigo) return null

  const imageUrl = artigo.imagem_url || `https://img.usecurling.com/p/1200/600?q=health&color=blue`
  const categoryName = artigo.expand?.categoria_id?.nome || 'Sem Categoria'
  const pubDate = artigo.data_publicacao || artigo.created

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6 pb-20 w-full animate-fade-in">
      <Button
        variant="ghost"
        asChild
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
      >
        <Link to="/biblioteca">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Biblioteca
        </Link>
      </Button>

      <div className="rounded-xl overflow-hidden mb-8 shadow-sm aspect-[21/9] w-full bg-muted">
        <img src={imageUrl} alt={artigo.titulo} className="w-full h-full object-cover" />
      </div>

      <div className="space-y-4 mb-8">
        <Badge variant="secondary" className="bg-primary/10 text-primary mb-2">
          {categoryName}
        </Badge>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          {artigo.titulo}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4 py-4 border-y">
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            {artigo.autor || 'Autor Desconhecido'}
          </div>
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(new Date(pubDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            {artigo.visualizacoes || 0} visualizações
          </div>
        </div>
      </div>

      <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">
        {artigo.conteudo}
      </div>
    </div>
  )
}
