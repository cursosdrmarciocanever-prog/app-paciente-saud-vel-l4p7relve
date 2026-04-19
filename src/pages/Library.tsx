import { MOCK_LIBRARY } from '@/lib/mock-data'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, FileText, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Library() {
  const categories = ['Todos', 'Treinos em Casa', 'Receitas Fit', 'Mentalidade/Mindset', 'Saúde']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Conteúdo</h2>
          <p className="text-muted-foreground">
            Materiais educativos para potencializar seus resultados.
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="w-4 h-4 mr-2" /> Filtrar
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <Badge
            key={i}
            variant={i === 0 ? 'default' : 'secondary'}
            className="rounded-full px-4 py-1.5 cursor-pointer text-sm whitespace-nowrap"
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
        {MOCK_LIBRARY.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {item.type === 'video' ? (
                  <PlayCircle className="w-12 h-12 text-white" />
                ) : (
                  <FileText className="w-12 h-12 text-white" />
                )}
              </div>
              <Badge className="absolute top-2 right-2 bg-black/60 text-white backdrop-blur-sm border-none hover:bg-black/70">
                {item.category}
              </Badge>
            </div>
            <CardContent className="p-4 pb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {item.type === 'video' ? (
                  <PlayCircle className="w-3 h-3" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                <span className="uppercase tracking-wider font-semibold">
                  {item.type === 'video' ? 'Vídeo' : 'Artigo'}
                </span>
              </div>
              <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {item.title}
              </h3>
            </CardContent>
            <CardFooter className="px-4 pb-4 pt-0">
              <Button variant="link" className="px-0 text-primary h-auto">
                Acessar conteúdo &rarr;
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
