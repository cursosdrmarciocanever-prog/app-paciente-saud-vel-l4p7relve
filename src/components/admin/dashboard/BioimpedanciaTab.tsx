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
import { getBioimpedanciaDashboard, deleteAdminRecord } from '@/services/admin-dashboard-tabs'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function BioimpedanciaTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const records = await getBioimpedanciaDashboard()
      setData(records)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as medições.',
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
    if (!window.confirm('Tem certeza que deseja deletar este relatório?')) return
    try {
      await deleteAdminRecord('bioimpedancia_pdf', id)
      toast({ title: 'Sucesso', description: 'Relatório deletado.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao deletar.', variant: 'destructive' })
    }
  }

  const filtered = data.filter((item) => {
    return (
      item.expand?.usuario_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.expand?.usuario_id?.email?.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
        />
      </div>

      <div className="hidden md:block rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data Medição</TableHead>
              <TableHead>Massa Magra (kg)</TableHead>
              <TableHead>% Gordura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-800">
                  {item.expand?.usuario_id?.name || item.expand?.usuario_id?.email}
                </TableCell>
                <TableCell>{new Date(item.data_medicao).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{item.massa_magra || '-'}</TableCell>
                <TableCell>
                  {item.percentual_gordura ? `${item.percentual_gordura}%` : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(pb.files.getUrl(item, item.arquivo), '_blank')}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(pb.files.getUrl(item, item.arquivo), '_blank')}
                    title="Baixar"
                  >
                    <Download className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden grid gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="border rounded-md p-4 bg-white space-y-2 shadow-sm">
            <div className="font-medium text-slate-800">
              {item.expand?.usuario_id?.name || item.expand?.usuario_id?.email}
            </div>
            <div className="text-sm text-slate-500">
              Data: {new Date(item.data_medicao).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Massa Magra: {item.massa_magra || '-'} kg</span>
              <span>Gordura: {item.percentual_gordura ? `${item.percentual_gordura}%` : '-'}</span>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(pb.files.getUrl(item, item.arquivo), '_blank')}
              >
                <Eye className="h-4 w-4 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(pb.files.getUrl(item, item.arquivo), '_blank')}
              >
                <Download className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
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
