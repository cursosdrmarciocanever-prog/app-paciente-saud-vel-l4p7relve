import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  type Video,
  type Categoria,
} from '@/services/conteudo'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { VideoForm } from './VideoForm'
import { ContentList, type ContentItem } from './ContentList'
import { ContentFilters } from './ContentFilters'

interface Props {
  categorias: Categoria[]
}

export function VideosManager({ categorias }: Props) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Video | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getVideos({ sort: '-created' })
      setVideos(data)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao carregar vídeos.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = videos.filter((v) => {
    if (filterCat !== 'all' && v.categoria_id !== filterCat) return false
    if (filterStatus === 'published' && !v.publicado) return false
    if (filterStatus === 'draft' && v.publicado) return false
    if (search && !v.titulo.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      if (editingItem?.id) await updateVideo(editingItem.id, data)
      else await createVideo(data as Video)
      toast({ title: 'Sucesso', description: 'Vídeo salvo com sucesso.' })
      setIsFormOpen(false)
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteVideo(deletingId)
      toast({ title: 'Sucesso', description: 'Vídeo removido.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const openEdit = (item: ContentItem) => {
    setEditingItem(item as Video)
    setIsFormOpen(true)
  }

  const handleView = (item: ContentItem) => {
    window.open(item.url_youtube, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#D4A574]"></div>
      </div>
    )
  }

  return (
    <div>
      <ContentFilters
        search={search}
        onSearchChange={setSearch}
        categoria={filterCat}
        onCategoriaChange={setFilterCat}
        status={filterStatus}
        onStatusChange={setFilterStatus}
        categorias={categorias}
        onAdd={openCreate}
        addButtonText="Novo Vídeo"
      />
      <ContentList
        items={filtered}
        categorias={categorias}
        onEdit={openEdit}
        onDelete={setDeletingId}
        onView={handleView}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Vídeo' : 'Novo Vídeo'}</DialogTitle>
          </DialogHeader>
          <VideoForm
            key={editingItem?.id || 'new'}
            initialData={editingItem || undefined}
            categorias={categorias}
            onSubmit={handleSave}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSaving}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O vídeo será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
