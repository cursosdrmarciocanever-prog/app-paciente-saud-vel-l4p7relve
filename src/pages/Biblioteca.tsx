import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArtigos, getVideos, getCategorias, updateVideo } from '@/services/conteudo'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { ArtigoCard } from '@/components/biblioteca/artigo-card'
import { VideoCard } from '@/components/biblioteca/video-card'
import { GridSkeleton } from '@/components/biblioteca/grid-skeleton'
import { EmptyState } from '@/components/biblioteca/empty-state'
import { ArtigoExpandido, VideoExpandido, CategoriaComId } from '@/components/biblioteca/types'

export default function Biblioteca() {
  const [activeTab, setActiveTab] = useState('artigos')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState<string>('_all')

  const [artigos, setArtigos] = useState<ArtigoExpandido[]>([])
  const [videos, setVideos] = useState<VideoExpandido[]>([])
  const [categorias, setCategorias] = useState<CategoriaComId[]>([])

  const [loading, setLoading] = useState(true)

  const [videoPlayerModalOpen, setVideoPlayerModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoExpandido | null>(null)

  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const cats = await getCategorias()
        setCategorias(cats as CategoriaComId[])
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }
    fetchCategorias()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const filters = ['publicado = true']

        if (selectedCategory && selectedCategory !== '_all') {
          filters.push(`categoria_id = "${selectedCategory}"`)
        }

        if (debouncedSearch) {
          filters.push(`titulo ~ "${debouncedSearch}"`)
        }

        const filterString = filters.join(' && ')
        const options = { filter: filterString, sort: '-created', expand: 'categoria_id' }

        if (activeTab === 'artigos') {
          const data = await getArtigos(options)
          setArtigos(data as unknown as ArtigoExpandido[])
        } else {
          const data = await getVideos(options)
          setVideos(data as unknown as VideoExpandido[])
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao carregar os dados. Tente novamente mais tarde.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [debouncedSearch, selectedCategory, activeTab, toast])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('_all')
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url
  }

  const handleAssistir = async (video: VideoExpandido) => {
    setSelectedVideo(video)
    setVideoPlayerModalOpen(true)
    try {
      const newVisualizacoes = (video.visualizacoes || 0) + 1
      await updateVideo(video.id, { visualizacoes: newVisualizacoes })

      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, visualizacoes: newVisualizacoes } : v)),
      )
    } catch (error) {
      console.error('Erro ao atualizar visualizações', error)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 md:px-6 w-full animate-fade-in">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Saúde</h1>
        <p className="text-muted-foreground">Artigos e vídeos para sua saúde</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pelo título..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Todas as Categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas as Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchTerm || selectedCategory !== '_all') && (
          <Button variant="ghost" onClick={handleClearFilters} className="md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full justify-start max-w-md h-auto p-1">
          <TabsTrigger value="artigos" className="flex-1 py-2 text-base">
            Artigos
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 py-2 text-base">
            Vídeos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artigos" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <GridSkeleton />
          ) : artigos.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artigos.map((artigo) => (
                <ArtigoCard
                  key={artigo.id}
                  artigo={artigo}
                  onClick={() => navigate(`/biblioteca/artigos/${artigo.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <GridSkeleton />
          ) : videos.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} onPlay={() => handleAssistir(video)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={videoPlayerModalOpen} onOpenChange={setVideoPlayerModalOpen}>
        <DialogContent className="max-w-4xl bg-background border-border sm:rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">{selectedVideo?.titulo}</DialogTitle>
            <DialogDescription className="sr-only">
              Assistir vídeo {selectedVideo?.titulo}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full px-6 pb-6">
            {selectedVideo && (
              <iframe
                width="100%"
                height="100%"
                src={getYoutubeEmbedUrl(selectedVideo.url_youtube)}
                title={selectedVideo.titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-md shadow-inner bg-black"
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
