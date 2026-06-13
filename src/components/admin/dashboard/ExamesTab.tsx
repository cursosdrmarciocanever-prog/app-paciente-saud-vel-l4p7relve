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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getExamesDashboard, deleteAdminRecord } from '@/services/admin-dashboard-tabs'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function ExamesTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const records = await getExamesDashboard()
      setData(records)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os exames.',
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
    if (!window.confirm('Tem certeza que deseja deletar este exame?')) return
    try {
      await deleteAdminRecord('exames_pdf', id)
      toast({ title: 'Sucesso', description: 'Exame deletado.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao deletar.', variant: 'destructive' })
    }
  }

  const filtered = data.filter((item) => {
    const matchName =
      item.expand?.usuario_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.expand?.usuario_id?.email?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'todos' || item.tipo_exame === typeFilter
    return matchName && matchType
  })

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="Tipo de Exame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="sangue">Sangue</SelectItem>
            <SelectItem value="imagem">Imagem</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Nome Exame</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data Exame</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((exame) => (
              <TableRow key={exame.id}>
                <TableCell className="font-medium text-slate-800">
                  {exame.expand?.usuario_id?.name || exame.expand?.usuario_id?.email}
                </TableCell>
                <TableCell>{exame.nome_exame}</TableCell>
                <TableCell className="capitalize">{exame.tipo_exame}</TableCell>
                <TableCell>{new Date(exame.data_exame).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{formatBytes(exame.tamanho_bytes)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(pb.files.getUrl(exame, exame.arquivo), '_blank')}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(pb.files.getUrl(exame, exame.arquivo), '_blank')}
                    title="Baixar"
                  >
                    <Download className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exame.id)}
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden grid gap-4">
        {filtered.map((exame) => (
          <div key={exame.id} className="border rounded-md p-4 bg-white space-y-2 shadow-sm">
            <div className="font-medium text-slate-800">
              {exame.expand?.usuario_id?.name || exame.expand?.usuario_id?.email}
            </div>
            <div className="text-sm text-slate-600 font-semibold">{exame.nome_exame}</div>
            <div className="flex justify-between text-sm text-slate-500">
              <span className="capitalize">{exame.tipo_exame}</span>
              <span>{formatBytes(exame.tamanho_bytes)}</span>
            </div>
            <div className="text-sm text-slate-500">
              {new Date(exame.data_exame).toLocaleDateString('pt-BR')}
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(pb.files.getUrl(exame, exame.arquivo), '_blank')}
              >
                <Eye className="h-4 w-4 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(pb.files.getUrl(exame, exame.arquivo), '_blank')}
              >
                <Download className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(exame.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
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
    </div>
  )
}
