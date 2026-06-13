import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getFotos, deleteFoto, FotoPaciente } from '@/services/fotos'
import { PhotoUpload } from '@/components/fotos/PhotoUpload'
import { PhotoCard } from '@/components/fotos/PhotoCard'
import { useToast } from '@/hooks/use-toast'
import { Image as ImageIcon } from 'lucide-react'

export default function FotosPaciente() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [fotos, setFotos] = useState<FotoPaciente[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFotos = async () => {
    if (!user) return
    try {
      const data = await getFotos(user.id)
      setFotos(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as fotos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFotos()
  }, [user])

  useRealtime('fotos_paciente', () => {
    fetchFotos()
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteFoto(id)
      toast({ title: 'Sucesso', description: 'Foto removida.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover foto.', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <PhotoUpload currentCount={fotos.length} maxPhotos={10} onSuccess={fetchFotos} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#4A4A4A]">Galeria de Evolução</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[300px] bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : fotos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border shadow-sm">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">Nenhuma foto enviada ainda.</p>
            <p className="text-sm text-muted-foreground/70">
              As fotos que você enviar aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fotos.map((foto) => (
              <PhotoCard key={foto.id} foto={foto} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
