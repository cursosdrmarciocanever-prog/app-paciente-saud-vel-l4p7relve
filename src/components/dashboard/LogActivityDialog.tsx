import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { Plus } from 'lucide-react'

export function LogActivityDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    duration_minutes: 30,
    activity_type: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await pb.collection('physical_activity').create({
        user: userId,
        date: new Date(formData.date).toISOString(),
        duration_minutes: formData.duration_minutes,
        activity_type: formData.activity_type,
      })
      toast.success('Atividade registrada com sucesso!')
      setOpen(false)
      setFormData((prev) => ({ ...prev, activity_type: '' }))
    } catch (error) {
      toast.error('Erro ao registrar atividade.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Registrar Atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Atividade</DialogTitle>
          <DialogDescription>
            Adicione sua atividade física do dia para acompanhar seu progresso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Atividade (opcional)</Label>
            <Input
              id="type"
              placeholder="Ex: Musculação, Corrida"
              value={formData.activity_type}
              onChange={(e) => setFormData((prev) => ({ ...prev, activity_type: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Atividade'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
