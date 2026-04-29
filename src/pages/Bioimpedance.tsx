import { useState, useEffect } from 'react'
import {
  getBioimpedances,
  createBioimpedance,
  getFileUrl,
  BioimpedanceRecord,
} from '@/services/bioimpedance'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { FileText, Download, Activity, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function Bioimpedance() {
  const { user } = useAuth()
  const [records, setRecords] = useState<BioimpedanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const data = await getBioimpedances()
      setRecords(data)
    } catch (err) {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('bioimpedance', () => {
    loadData()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!user) return
    if (!date) {
      setErrors({ date: 'Data é obrigatória' })
      return
    }

    if (file && file.size > 10485760) {
      setErrors({ report: 'O arquivo não pode exceder 10MB' })
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('user', user.id)
    formData.append('date', new Date(date).toISOString())
    formData.append('notes', notes)
    if (file) {
      formData.append('report', file)
    }

    try {
      await createBioimpedance(formData)
      toast.success('Bioimpedância adicionada com sucesso!')
      setOpen(false)
      setDate('')
      setNotes('')
      setFile(null)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) {
        toast.error('Erro ao salvar registro.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Bioimpedância</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Bioimpedância</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data da Avaliação</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="report">Arquivo (PDF, JPG, PNG)</Label>
                <Input
                  id="report"
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {errors.report && <p className="text-sm text-destructive">{errors.report}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionais sobre a avaliação..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Registro'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      ) : records.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhuma avaliação de bioimpedância encontrada.</p>
            <p className="text-sm mt-1">
              Clique no botão acima para adicionar seu primeiro relatório.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {format(new Date(record.date), 'dd/MM/yyyy')}
                </CardTitle>
                <FileText className="w-4 h-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                  {record.notes || <span className="italic opacity-50">Sem observações</span>}
                </p>
                {record.report ? (
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <a
                      href={getFileUrl(record.id, record.report)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Relatório
                    </a>
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full opacity-50" disabled>
                    Sem anexo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
