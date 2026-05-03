import { useEffect, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAppointmentsAdmin, cancelAppointment } from '@/services/admin'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  const loadData = () => getAppointmentsAdmin().then(setAppointments)
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('appointments', loadData)

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta consulta? O paciente será notificado.')) {
      await cancelAppointment(id)
      toast({ title: 'Cancelada', description: 'Consulta cancelada com sucesso.' })
    }
  }

  const filtered = useMemo(() => {
    let res = appointments
    if (typeFilter !== 'all') res = res.filter((a) => a.type === typeFilter)
    if (statusFilter !== 'all') res = res.filter((a) => a.status === statusFilter)
    return res
  }, [appointments, typeFilter, statusFilter])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Oversight de Consultas</h1>
      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="telemedicina">Telemedicina</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhuma consulta encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.expand?.user?.name || a.expand?.user?.email}</TableCell>
                  <TableCell>{new Date(a.date).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="capitalize">{a.type}</TableCell>
                  <TableCell className="capitalize">{a.status}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAppt(a)}>
                      Visualizar
                    </Button>
                    {a.status !== 'cancelado' && (
                      <Button variant="destructive" size="sm" onClick={() => handleCancel(a.id)}>
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedAppt}
        onOpenChange={(val) => {
          if (!val) setSelectedAppt(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Consulta</DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-semibold text-muted-foreground">Paciente:</span>
                <span>{selectedAppt.expand?.user?.name || selectedAppt.expand?.user?.email}</span>
                <span className="font-semibold text-muted-foreground">Data/Hora:</span>
                <span>{new Date(selectedAppt.date).toLocaleString('pt-BR')}</span>
                <span className="font-semibold text-muted-foreground">Tipo:</span>
                <span className="capitalize">{selectedAppt.type}</span>
                <span className="font-semibold text-muted-foreground">Status:</span>
                <span className="capitalize">{selectedAppt.status}</span>
                <span className="font-semibold text-muted-foreground">Motivo/Título:</span>
                <span>{selectedAppt.title || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground block mb-1">
                  Notas:
                </span>
                <p className="bg-muted p-2 rounded text-sm min-h-[60px]">
                  {selectedAppt.notes || 'Nenhuma nota registrada.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
