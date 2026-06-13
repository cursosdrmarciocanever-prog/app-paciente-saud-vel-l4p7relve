import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, CalendarIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArtigoExpandido } from './types'

interface ArtigoCardProps {
  artigo: ArtigoExpandido
  onClick: () => void
}

export function ArtigoCard({ artigo, onClick }: ArtigoCardProps) {
  const imageUrl = artigo.imagem_url || `https://img.usecurling.com/p/600/400?q=health&color=blue`
  const categoryName = artigo.expand?.categoria_id?.nome || 'Sem Categoria'
  const pubDate = artigo.data_publicacao || artigo.created
  const truncateDesc =
    artigo.descricao.length > 100 ? artigo.descricao.substring(0, 100) + '...' : artigo.descricao

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300">
      <div className="aspect-video w-full overflow-hidden">
        <img src={imageUrl} alt={artigo.titulo} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="flex-1 pb-2">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            {categoryName}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Eye className="mr-1 h-3 w-3" />
            {artigo.visualizacoes || 0}
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-xl">{artigo.titulo}</CardTitle>
        <CardDescription className="line-clamp-3 mt-2">{truncateDesc}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-4 flex justify-between items-center border-t mt-auto">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="mr-1 h-3 w-3" />
          {format(new Date(pubDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
        </div>
        <Button variant="outline" size="sm" onClick={onClick}>
          Ler Artigo
        </Button>
      </CardFooter>
    </Card>
  )
}
