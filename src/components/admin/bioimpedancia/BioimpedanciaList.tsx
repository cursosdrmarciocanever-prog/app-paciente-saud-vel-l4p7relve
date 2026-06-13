import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Download, Trash2, Eye, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import pb from '@/lib/pocketbase/client'

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function BioimpedanciaList({ refreshTrigger }: { refreshTrigger: number }) {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const result = await pb.collection('bioimpedancia_pdf').getList(page, 20, {
        sort: '-data_medicao',
        expand: 'usuario_id',
        filter: search ? `usuario_id.name ~ "${search}" || usuario_id.email ~ "${search}"` : '',
      })
      setItems(result.items)
      setTotalPages(result.totalPages || 1)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os registros.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchItems()
    }, 500)
    return () => clearTimeout(delay)
  }, [fetchItems, refreshTrigger])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await pb.collection('bioimpedancia_pdf').delete(deleteId)
      toast({ title: 'Sucesso', description: 'Registro apagado com sucesso.' })
      fetchItems()
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível apagar.', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleDownload = (record: any) => {
    const url = pb.files.getURL(record, record.arquivo)
    const link = document.createElement('a')
    link.href = `${url}?download=1`
    link.download = record.arquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (record: any) => {
    const url = pb.files.getURL(record, record.arquivo)
    window.open(url, '_blank')
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm flex flex-col h-full">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-primary">Histórico de Exames</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>
      </div>

      <div className="p-0 flex-1">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhum exame encontrado.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data Medição</TableHead>
                    <TableHead>Massa Magra</TableHead>
                    <TableHead>% Gordura</TableHead>
                    <TableHead>Tamanho PDF</TableHead>
                    <TableHead>Data Upload</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.expand?.usuario_id?.name || item.expand?.usuario_id?.email || 'N/A'}
                      </TableCell>
                      <TableCell>{format(new Date(item.data_medicao), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{item.massa_magra ? `${item.massa_magra} kg` : '-'}</TableCell>
                      <TableCell>
                        {item.percentual_gordura ? `${item.percentual_gordura}%` : '-'}
                      </TableCell>
                      <TableCell>{formatBytes(item.tamanho_bytes)}</TableCell>
                      <TableCell>{format(new Date(item.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(item)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(item)}
                            title="Baixar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Apagar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col p-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-3 bg-background shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">
                      {item.expand?.usuario_id?.name || item.expand?.usuario_id?.email || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(new Date(item.data_medicao), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Massa: {item.massa_magra ? `${item.massa_magra} kg` : '-'}</div>
                    <div>
                      Gordura: {item.percentual_gordura ? `${item.percentual_gordura}%` : '-'}
                    </div>
                    <div>Tamanho: {formatBytes(item.tamanho_bytes)}</div>
                    <div>Upload: {format(new Date(item.created), 'dd/MM/yyyy')}</div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleView(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(item)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-center gap-2 items-center mt-auto bg-card rounded-b-lg">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar este exame? Esta ação não poderá ser desfeita e o PDF
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
