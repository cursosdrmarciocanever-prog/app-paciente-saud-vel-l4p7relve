import { Eye } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VideoExpandido } from './types'

interface VideoCardProps {
  video: VideoExpandido
  onPlay: () => void
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  const imageUrl =
    video.thumbnail_url || `https://img.usecurling.com/p/600/400?q=video&color=yellow`
  const categoryName = video.expand?.categoria_id?.nome || 'Sem Categoria'
  const truncateDesc =
    video.descricao.length > 100 ? video.descricao.substring(0, 100) + '...' : video.descricao

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300">
      <div
        className="relative aspect-video w-full overflow-hidden group cursor-pointer"
        onClick={onPlay}
      >
        <img
          src={imageUrl}
          alt={video.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-primary-foreground ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {video.duracao_minutos && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duracao_minutos} min
          </div>
        )}
      </div>
      <CardHeader className="flex-1 pb-2">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            {categoryName}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Eye className="mr-1 h-3 w-3" />
            {video.visualizacoes || 0}
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-xl">{video.titulo}</CardTitle>
        <CardDescription className="line-clamp-3 mt-2">{truncateDesc}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-4 flex justify-end border-t mt-auto">
        <Button variant="default" size="sm" onClick={onPlay}>
          Assistir
        </Button>
      </CardFooter>
    </Card>
  )
}
