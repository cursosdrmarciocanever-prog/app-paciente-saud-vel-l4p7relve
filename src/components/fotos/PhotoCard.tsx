import { FotoPaciente } from '@/services/fotos'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'

interface PhotoCardProps {
  foto: FotoPaciente
  onDelete: (id: string) => void
}

export function PhotoCard({ foto, onDelete }: PhotoCardProps) {
  const imageUrl = pb.files.getURL(foto, foto.foto)

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = foto.foto
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(objectUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download falhou', error)
    }
  }

  return (
    <Card className="overflow-hidden group hover:shadow-[0_8px_30px_rgb(212,165,116,0.15)] transition-all duration-300 border-border/50">
      <div className="relative aspect-square bg-[#F5F5F5]">
        <img
          src={imageUrl}
          alt={foto.descricao || 'Evolução'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full hover:scale-105 transition-transform"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full hover:scale-105 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar foto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A foto será removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(foto.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-[#D4A574] mb-2">
          {format(new Date(foto.created), "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </p>
        {foto.descricao && <p className="text-sm text-[#4A4A4A] line-clamp-2">{foto.descricao}</p>}
      </CardContent>
    </Card>
  )
}
