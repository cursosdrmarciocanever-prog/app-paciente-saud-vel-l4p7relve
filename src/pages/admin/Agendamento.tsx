import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getSlots, createSlot, updateSlot, deleteSlot, Slot } from '@/services/slots'
import { SlotForm } from '@/components/admin/SlotForm'
import { SlotTable } from '@/components/admin/SlotTable'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function Agendamento() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [deletingSlot, setDeletingSlot] = useState<Slot | null>(null)
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({})
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const loadSlots = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await getSlots(user.id, dateFilter.from, dateFilter.to)
      setSlots(data)
    } catch (e) {
      toast({ title: 'Erro ao carregar horários', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [user, dateFilter])

  useRealtime('slots_disponiveis', () => {
    loadSlots()
  })

  const handleCreate = async (data: any) => {
    try {
      await createSlot({
        ...data,
        data: format(data.data, 'yyyy-MM-dd') + ' 00:00:00.000Z',
        medico_id: user?.id,
        agendado: false,
      })
      toast({ title: 'Slot adicionado com sucesso' })
      setFormKey((k) => k + 1)
    } catch (e) {
      toast({ title: 'Erro ao adicionar slot', variant: 'destructive' })
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editingSlot) return
    try {
      await updateSlot(editingSlot.id, {
        ...data,
        data: format(data.data, 'yyyy-MM-dd') + ' 00:00:00.000Z',
      })
      toast({ title: 'Slot atualizado com sucesso' })
      setIsEditOpen(false)
    } catch (e) {
      toast({ title: 'Erro ao atualizar slot', variant: 'destructive' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingSlot) return
    try {
      await deleteSlot(deletingSlot.id)
      toast({ title: 'Slot excluído com sucesso' })
      setDeletingSlot(null)
    } catch (e) {
      toast({ title: 'Erro ao excluir slot', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#4A4A4A]">Adicionar Novo Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <SlotForm key={formKey} existingSlots={slots} onSubmit={handleCreate} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-[#4A4A4A]">Slots Cadastrados</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[260px] justify-start text-left font-normal',
                    !dateFilter.from && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter.from ? (
                    dateFilter.to ? (
                      `${format(dateFilter.from, 'dd/MM/yyyy')} - ${format(dateFilter.to, 'dd/MM/yyyy')}`
                    ) : (
                      format(dateFilter.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Filtrar por período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateFilter.from, to: dateFilter.to }}
                  onSelect={(r: any) => setDateFilter(r || {})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4A574]" />
            </div>
          ) : (
            <SlotTable
              slots={slots}
              onEdit={(slot) => {
                setEditingSlot(slot)
                setIsEditOpen(true)
              }}
              onDelete={setDeletingSlot}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Slot</DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <SlotForm
              initialData={editingSlot}
              existingSlots={slots}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingSlot} onOpenChange={(open) => !open && setDeletingSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir este horário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O slot será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
