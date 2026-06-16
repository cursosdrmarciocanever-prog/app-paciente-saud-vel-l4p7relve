import { useState, useEffect } from 'react'
import { Search, Download, Trash2, Eye, Loader2 } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getFotosDashboard, deleteAdminRecord } from '@/services/admin-dashboard-tabs'
import { FotoUploadForm } from './FotoUploadForm'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function FotosTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const records = await getFotosDashboard()
      setData(records)
    } catch (err) {
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
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta foto?')) return
    try {
      await deleteAdminRecord('fotos_paciente', id)
      toast({ title: 'Sucesso', description: 'Foto deletada com sucesso.' })
      if (selectedUser) {
        const remaining = selectedUser.fotos.filter((f: any) => f.id !== id)
        if (remaining.length === 0) setSelectedUser(null)
        else setSelectedUser({ ...selectedUser, fotos: remaining })
      }
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao deletar foto.', variant: 'destructive' })
    }
  }

  const grouped = data.reduce(
    (acc, curr) => {
      const user = curr.expand?.usuario_id
      if (!user) return acc
      if (!acc[user.id]) acc[user.id] = { user, fotos: [], latest: curr.created }
      acc[user.id].fotos.push(curr)
      if (curr.created > acc[user.id].latest) acc[user.id].latest = curr.created
      return acc
    },
    {} as Record<string, any>,
  )

  const filtered = Object.values(grouped).filter(
    (g: any) =>
      g.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.user.email?.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <FotoUploadForm onSuccess={loadData} />

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
        />
      </div>

      <div className="hidden md:block rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Quantidade de Fotos</TableHead>
              <TableHead>Data Última Foto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((g: any) => (
              <TableRow key={g.user.id}>
                <TableCell className="font-medium text-slate-800">
                  {g.user.name || g.user.email}
                </TableCell>
                <TableCell>{g.fotos.length}</TableCell>
                <TableCell>{new Date(g.latest).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setSelectedUser(g)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Ver Galeria
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden grid gap-4">
        {filtered.map((g: any) => (
          <div key={g.user.id} className="border rounded-md p-4 bg-white space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800">{g.user.name || g.user.email}</span>
              <span className="text-sm bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                {g.fotos.length} fotos
              </span>
            </div>
            <div className="text-sm text-slate-500">
              Última foto: {new Date(g.latest).toLocaleDateString('pt-BR')}
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setSelectedUser(g)}
              >
                <Eye className="h-4 w-4 mr-2" /> Ver Galeria
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-4 text-slate-500 bg-white border rounded-md">
            Nenhum registro encontrado.
          </div>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Galeria de {selectedUser?.user?.name || selectedUser?.user?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-2">
            {selectedUser?.fotos.map((f: any) => (
              <div
                key={f.id}
                className="relative group rounded-lg overflow-hidden border shadow-sm"
              >
                <img
                  src={pb.files.getUrl(f, f.foto)}
                  alt={f.descricao}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => window.open(pb.files.getUrl(f, f.foto), '_blank')}
                    title="Baixar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(f.id)}
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
