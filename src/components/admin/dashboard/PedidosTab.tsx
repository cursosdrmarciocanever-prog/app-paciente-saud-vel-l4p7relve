import { useState, useEffect, useRef } from 'react'
import { Search, Eye, Trash2, Loader2, Upload } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  getPedidosDashboard,
  updatePedidoStatus,
  deleteAdminRecord,
} from '@/services/admin-dashboard-tabs'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { createCatalogoInjetavel } from '@/services/catalogo'

const statusSchema = z.enum(['pendente_pagamento', 'pago', 'agendado', 'enviado', 'cancelado'])

export function PedidosTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cpfMap, setCpfMap] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result as string
      if (!text) return

      const lines = text.split('\n')
      if (lines.length < 2) {
        toast({
          title: 'Erro',
          description: 'Arquivo CSV vazio ou inválido',
          variant: 'destructive',
        })
        return
      }

      const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase())
      const parsed = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(/[,;]/).map((v) => v.trim().replace(/^"|"$/g, ''))
        const obj: any = { ativo: true }

        headers.forEach((h, index) => {
          if (h.includes('produto') || h === 'nome') obj.produto = values[index]
          if (h.includes('tipo')) obj.tipo = values[index]
          if (h.includes('funcao') || h.includes('função')) obj.funcao = values[index]
          if (h.includes('via') || h.includes('administracao') || h.includes('administração'))
            obj.via_administracao = values[index]
          if (h.includes('ponsologia') || h.includes('posologia'))
            obj.ponsologia_recomendada = values[index]
          if (h.includes('valor') || h.includes('preco') || h.includes('preço'))
            obj.valor = parseFloat(values[index].replace(',', '.')) || 0
        })

        if (obj.produto) parsed.push(obj)
      }

      if (parsed.length === 0) {
        toast({
          title: 'Erro',
          description: 'Nenhum produto válido encontrado no CSV.',
          variant: 'destructive',
        })
        return
      }

      try {
        setImporting(true)
        for (const item of parsed) {
          await createCatalogoInjetavel(item)
        }
        toast({
          title: 'Sucesso',
          description: `${parsed.length} produtos importados para o catálogo.`,
        })
        setImportModalOpen(false)
      } catch (err) {
        toast({
          title: 'Erro',
          description: 'Falha ao importar produtos. Verifique o formato do arquivo.',
          variant: 'destructive',
        })
      } finally {
        setImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [records, usuarios] = await Promise.all([
        getPedidosDashboard(),
        pb.send<any[]>('/backend/v1/admin/usuarios', { method: 'GET' }).catch(() => []),
      ])
      const mapa: Record<string, string> = {}
      for (const u of usuarios || []) mapa[u.id] = (u.cpf || '').replace(/\D/g, '')
      setCpfMap(mapa)
      setData(records)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
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
    if (!window.confirm('Tem certeza que deseja deletar este pedido?')) return
    try {
      await deleteAdminRecord('pedidos_injetaveis', id)
      toast({ title: 'Sucesso', description: 'Pedido deletado.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao deletar.', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const parsed = statusSchema.parse(newStatus)
      await updatePedidoStatus(id, parsed)
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
      loadData()
      if (selectedPedido && selectedPedido.id === id) {
        setSelectedPedido({ ...selectedPedido, status: parsed })
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Status inválido ou falha na atualização.',
        variant: 'destructive',
      })
    }
  }

  const filtered = data.filter((item) => {
    const termo = search.toLowerCase()
    const termoCpf = search.replace(/\D/g, '')
    const cpfPaciente = cpfMap[item.usuario_id] || ''
    const matchBusca =
      !search ||
      item.expand?.usuario_id?.name?.toLowerCase().includes(termo) ||
      item.expand?.usuario_id?.email?.toLowerCase().includes(termo) ||
      (!!termoCpf && cpfPaciente.includes(termoCpf))
    const matchStatus = statusFilter === 'todos' || item.status === statusFilter
    return matchBusca && matchStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'confirmado':
      case 'realizado':
        return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 border'
      case 'agendado':
      case 'enviado':
        return 'bg-blue-100 text-blue-800 border-blue-200 border'
      case 'cancelado':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 border'
      case 'pendente_pagamento':
      default:
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 border'
    }
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
            placeholder="Buscar por CPF ou paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente_pagamento">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setImportModalOpen(true)}
            className="bg-[#D4A574] hover:bg-[#c29665] text-white whitespace-nowrap"
          >
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar em Bloco</span>
          </Button>
        </div>
      </div>

      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Catálogo de Injetáveis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">
              Faça upload de um arquivo CSV contendo os produtos para popular o catálogo geral. As
              colunas recomendadas são:{' '}
              <strong>
                produto, tipo, função, via_administracao, ponsologia_recomendada, valor
              </strong>
              .
            </p>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-slate-500">CSV ou TXT</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".csv,.txt"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={importing}
                />
              </label>
            </div>
            {importing && (
              <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" /> Importando produtos...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="hidden md:block rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-800">
                  {item.expand?.usuario_id?.name || item.expand?.usuario_id?.email}
                </TableCell>
                <TableCell>{item.expand?.injetavel_id?.nome}</TableCell>
                <TableCell className="capitalize">{item.tipo_compra}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>R$ {item.preco_total?.toFixed(2)}</TableCell>
                <TableCell className="capitalize">
                  {item.opcao_entrega?.replace('_', ' ')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(item.status)}>
                    {item.status?.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPedido(item)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4 text-slate-600" />
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
                <TableCell colSpan={8} className="text-center text-slate-500">
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
            <div className="flex justify-between items-start">
              <div className="font-medium text-slate-800">
                {item.expand?.usuario_id?.name || item.expand?.usuario_id?.email}
              </div>
              <Badge variant="secondary" className={getStatusColor(item.status)}>
                {item.status?.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {item.expand?.injetavel_id?.nome}
            </div>
            <div className="flex justify-between text-sm text-[#4A4A4A]">
              <span className="capitalize">
                {item.tipo_compra} (x{item.quantidade})
              </span>
              <span className="text-primary font-medium">R$ {item.preco_total?.toFixed(2)}</span>
            </div>
            <div className="text-xs text-slate-500 capitalize">
              Entrega: {item.opcao_entrega?.replace('_', ' ')}
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t mt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPedido(item)}>
                <Eye className="h-4 w-4 text-slate-600" />
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

      <Dialog open={!!selectedPedido} onOpenChange={(open) => !open && setSelectedPedido(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-500">Paciente</p>
                  <p>{selectedPedido.expand?.usuario_id?.name}</p>
                  <p className="text-xs text-slate-400">
                    {selectedPedido.expand?.usuario_id?.email}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Produto</p>
                  <p>{selectedPedido.expand?.injetavel_id?.nome}</p>
                  <p className="text-xs text-slate-400">
                    {selectedPedido.tipo_compra} - Qtd: {selectedPedido.quantidade}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Total</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {selectedPedido.preco_total?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Status Atual</p>
                  <Badge variant="secondary" className={getStatusColor(selectedPedido.status)}>
                    {selectedPedido.status?.replace('_', ' ')}
                  </Badge>
                </div>
                {selectedPedido.opcao_entrega === 'agendar_clinica' && (
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="font-semibold text-slate-500">Data de Agendamento</p>
                    <p>
                      {selectedPedido.data_agendamento
                        ? new Date(selectedPedido.data_agendamento).toLocaleDateString('pt-BR')
                        : 'Não agendado'}
                    </p>
                  </div>
                )}
                {selectedPedido.opcao_entrega === 'enviar_endereco' && (
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="font-semibold text-slate-500">Endereço de Entrega</p>
                    <p>{selectedPedido.endereco_entrega || 'Não informado'}</p>
                  </div>
                )}
                {selectedPedido.stripe_payment_id && (
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="font-semibold text-slate-500">ID do Pagamento (Stripe)</p>
                    <p className="font-mono text-xs text-slate-600 break-all">
                      {selectedPedido.stripe_payment_id}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold text-sm mb-2 text-slate-800">Atualizar Status</p>
                <Select
                  value={selectedPedido.status}
                  onValueChange={(val) => handleStatusChange(selectedPedido.id, val)}
                >
                  <SelectTrigger className="border-primary/30 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente_pagamento">Pendente de Pagamento</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
