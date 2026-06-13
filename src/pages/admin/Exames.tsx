import { useState, useEffect, useCallback } from 'react'
import { getExames, deleteExame, getFileUrl, formatBytes } from '@/services/admin-exames'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Eye, Download, Search, FileText, Loader2 } from 'lucide-react'
import { ExameUploadDialog } from '@/components/admin/ExameUploadDialog'
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

export default function AdminExames() {
  const [exames, setExames] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadExames = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getExames(page, searchTerm, typeFilter)
      setExames(res.items)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao carregar exames.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, typeFilter, toast])

  useEffect(() => {
    const timer = setTimeout(() => loadExames(), 300)
    return () => clearTimeout(timer)
  }, [loadExames])

  const handleDelete = async (id: string) => {
    try {
      await deleteExame(id)
      toast({ title: 'Sucesso', description: 'Exame deletado.' })
      loadExames()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao deletar.', variant: 'destructive' })
    }
  }

  const handleDownload = (exame: any) => {
    window.open(getFileUrl(exame), '_blank')
  }

  const formatDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: ptBR })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Exames</h1>
          <p className="text-muted-foreground">Upload e gestão de PDFs clínicos dos pacientes.</p>
        </div>
        <ExameUploadDialog
          onSuccess={() => {
            setPage(1)
            loadExames()
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente por nome ou email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipo de exame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="sangue">Sangue</SelectItem>
            <SelectItem value="imagem">Imagem</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exames.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          Nenhum exame encontrado.
        </div>
      ) : (
        <>
          <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Nome do Exame</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Exame</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exames.map((ex) => (
                  <TableRow key={ex.id}>
                    <TableCell className="font-medium">
                      {ex.expand?.usuario_id?.name || 'Desconhecido'}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> {ex.nome_exame}
                    </TableCell>
                    <TableCell className="capitalize">{ex.tipo_exame}</TableCell>
                    <TableCell>{formatDate(ex.data_exame)}</TableCell>
                    <TableCell>{formatBytes(ex.tamanho_bytes)}</TableCell>
                    <TableCell>{formatDate(ex.created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(ex)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(ex)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar exame?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é irreversível.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ex.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {exames.map((ex) => (
              <div key={ex.id} className="border rounded-lg p-4 bg-card shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{ex.expand?.usuario_id?.name || 'Desconhecido'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <FileText className="h-3 w-3" /> {ex.nome_exame}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {ex.tipo_exame}
                  </span>
                </div>
                <div className="text-sm grid grid-cols-2 gap-2 text-muted-foreground border-t pt-2">
                  <div>
                    <p className="font-semibold text-foreground">Data Exame</p>
                    <p>{formatDate(ex.data_exame)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tamanho</p>
                    <p>{formatBytes(ex.tamanho_bytes)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(ex)}>
                    <Eye className="h-4 w-4 mr-2" /> Ver
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Deletar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar exame?</AlertDialogTitle>
                        <AlertDialogDescription>Ação irreversível.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(ex.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
