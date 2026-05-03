import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getVideos, VideoRecord, getVideoThumbnailUrl } from '@/services/videos'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Library() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const [filter, setFilter] = useState('Todos')

  useEffect(() => {
    getVideos()
      .then((data) => {
        setVideos(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const categories = [
    'Todos',
    ...Array.from(new Set(videos.map((v) => v.category).filter(Boolean))),
  ]
  const filteredVideos = filter === 'Todos' ? videos : videos.filter((v) => v.category === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Conteúdo</h2>
          <p className="text-muted-foreground">
            Materiais educativos para potencializar seus resultados.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <Badge
            key={i}
            variant={filter === cat ? 'default' : 'secondary'}
            className="rounded-full px-4 py-1.5 cursor-pointer text-sm whitespace-nowrap"
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg">
          Nenhum conteúdo encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {filteredVideos.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedVideo(item)}
              className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={getVideoThumbnailUrl(item.id, item.thumbnail)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <PlayCircle className="w-12 h-12 text-muted-foreground opacity-50" />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
                <Badge className="absolute top-2 right-2 bg-black/60 text-white backdrop-blur-sm border-none hover:bg-black/70">
                  {item.category}
                </Badge>
              </div>
              <CardContent className="p-4 pb-2">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          <DialogHeader className="p-4 bg-background">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && (
              <iframe
                src={selectedVideo.video_url}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
