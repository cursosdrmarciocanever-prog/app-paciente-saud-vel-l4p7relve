import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArtigosManager } from '@/components/admin/conteudos/ArtigosManager'
import { VideosManager } from '@/components/admin/conteudos/VideosManager'
import { BuscarArtigosCientificos } from '@/components/admin/conteudos/BuscarArtigosCientificos'
import { getCategorias, type Categoria } from '@/services/conteudo'
import { useToast } from '@/hooks/use-toast'

export default function ConteudosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const { toast } = useToast()

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch(() =>
        toast({
          title: 'Erro',
          description: 'Erro ao carregar categorias',
          variant: 'destructive',
        }),
      )
  }, [toast])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#4A4A4A]">Gestão de Conteúdos</h2>
        <p className="text-muted-foreground">
          Gerencie os artigos e vídeos disponíveis para os pacientes.
        </p>
      </div>

      <Tabs defaultValue="artigos" className="w-full">
        <TabsList className="grid w-full max-w-[560px] grid-cols-3">
          <TabsTrigger value="artigos">Artigos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="cientificos">Artigos Científicos</TabsTrigger>
        </TabsList>
        <TabsContent value="artigos" className="mt-6">
          <ArtigosManager categorias={categorias} />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <VideosManager categorias={categorias} />
        </TabsContent>
        <TabsContent value="cientificos" className="mt-6">
          <BuscarArtigosCientificos categorias={categorias} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
