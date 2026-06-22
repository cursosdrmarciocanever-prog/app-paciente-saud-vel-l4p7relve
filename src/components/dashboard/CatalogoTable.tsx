import { useEffect, useState } from 'react'
import {
  getCatalogoInjetaveis,
  deleteCatalogoInjetavel,
  type CatalogoInjetavel,
} from '@/services/catalogo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Loader2, Plus, Pencil, Trash2, CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { CatalogoFormModal } from './CatalogoFormModal'
import { AgendamentoInjetavelModal } from './AgendamentoInjetavelModal'

export function CatalogoTable({ hideHeader }: { hideHeader?: boolean } = {}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin =
    user?.email === 'admin@canever.com.br' || user?.email === 'marciocanever@hotmail.com'
  const [data, setData] = useState<CatalogoInjetavel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoInjetavel | null>(null)
  const [agendamentoModalOpen, setAgendamentoModalOpen] = useState(false)
  const [agendamentoItem, setAgendamentoItem] = useState<CatalogoInjetavel | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('catalogo_injetaveis', () => loadData())

  const loadData = async () => {
    try {
      setLoading(true)
      const items = await getCatalogoInjetaveis()
      setData(items)
    } catch (err) {
      console.error('Error fetching catalogo', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(
    (item) =>
      item.produto.toLowerCase().includes(search.toLowerCase()) ||
      (item.funcao && item.funcao.toLowerCase().includes(search.toLowerCase())) ||
      (item.tipo && item.tipo.toLowerCase().includes(search.toLowerCase())),
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este item?')) return
    try {
      await deleteCatalogoInjetavel(id)
      toast({ title: 'Item excluído com sucesso' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const handleEdit = (item: CatalogoInjetavel) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleNew = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleAgendar = (item: CatalogoInjetavel) => {
    setAgendamentoItem(item)
    setAgendamentoModalOpen(true)
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || value === 0) return 'Sob consulta'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <Card className="mt-8 shadow-sm">
      {!hideHeader && (
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Catálogo Completo de Injetáveis</CardTitle>
            <CardDescription>
              Consulte todos os tratamentos disponíveis, suas funções e valores.
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={handleNew} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Incluir Novo Catálogo
            </Button>
          )}
        </CardHeader>
      )}
      {hideHeader && isAdmin && (
        <div className="p-6 pb-0 flex justify-end">
          <Button onClick={handleNew} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Incluir Novo Catálogo
          </Button>
        </div>
      )}
      <div className="px-6 pb-2 pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto, função ou tipo..."
            className="pl-9 max-w-md bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <CardContent>
        <div className="rounded-md border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 min-w-[200px]">
                    Produto
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-slate-700 min-w-[250px]">
                    Função
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Via de Administração
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Posologia Recomendada
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Nenhum tratamento encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">{item.produto}</TableCell>
                      <TableCell>
                        {item.tipo ? (
                          <Badge variant="outline" className="font-normal">
                            {item.tipo}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">{item.funcao || '-'}</TableCell>
                      <TableCell className="text-slate-600 capitalize">
                        {item.via_administracao || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.ponsologia_recomendada || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary whitespace-nowrap">
                        {formatCurrency(item.valor)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                            onClick={() => handleAgendar(item)}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Agendar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <CatalogoFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          item={editingItem}
          onSuccess={loadData}
        />
        <AgendamentoInjetavelModal
          open={agendamentoModalOpen}
          onClose={() => setAgendamentoModalOpen(false)}
          item={agendamentoItem}
        />
      </CardContent>
    </Card>
  )
}
