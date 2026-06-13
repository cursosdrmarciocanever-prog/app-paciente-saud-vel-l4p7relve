import { format } from 'date-fns'
import { Slot } from '@/services/slots'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function SlotTable({
  slots,
  onEdit,
  onDelete,
}: {
  slots: Slot[]
  onEdit: (slot: Slot) => void
  onDelete: (slot: Slot) => void
}) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr.replace(' ', 'T')), 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell>{formatDate(slot.data)}</TableCell>
                <TableCell>{slot.hora_inicio}</TableCell>
                <TableCell>{slot.hora_fim}</TableCell>
                <TableCell className="capitalize">{slot.tipo}</TableCell>
                <TableCell>
                  <Badge
                    variant={slot.agendado ? 'default' : 'secondary'}
                    className={
                      slot.agendado
                        ? 'bg-[#D4A574] hover:bg-[#c39362]'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {slot.agendado ? 'Agendado' : 'Disponível'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(slot)}>
                    <Pencil className="h-4 w-4 text-[#4A4A4A]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(slot)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {slots.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum horário cadastrado para este período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-4 md:hidden">
        {slots.map((slot) => (
          <Card key={slot.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-[#4A4A4A]">{formatDate(slot.data)}</p>
                <p className="text-sm text-muted-foreground">
                  {slot.hora_inicio} - {slot.hora_fim}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {slot.tipo}
                  </Badge>
                  <Badge
                    variant={slot.agendado ? 'default' : 'secondary'}
                    className={
                      slot.agendado
                        ? 'bg-[#D4A574] hover:bg-[#c39362]'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {slot.agendado ? 'Agendado' : 'Disponível'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(slot)}>
                  <Pencil className="h-4 w-4 text-[#4A4A4A]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(slot)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {slots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            Nenhum horário cadastrado para este período.
          </div>
        )}
      </div>
    </>
  )
}
