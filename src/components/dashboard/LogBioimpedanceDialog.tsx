import { useState } from 'react'
import { createBioimpedance } from '@/services/bioimpedance'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Activity, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export function LogBioimpedanceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setDate('')
    setNotes('')
    setFile(null)
    setErrors({})
    setUploadProgress(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!user) return

    if (!date) {
      setErrors({ date: 'Data é obrigatória' })
      return
    }

    if (file) {
      if (file.size > 20971520) {
        setErrors({
          report: 'O arquivo selecionado é muito grande. O limite máximo permitido é de 20MB.',
        })
        return
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          report: 'Formato de arquivo não suportado. Por favor, envie um PDF ou imagem (PNG/JPG).',
        })
        return
      }
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('user', user.id)
    // Para evitar problemas de fuso horário, definimos a hora para o meio-dia UTC
    formData.append('date', new Date(`${date}T12:00:00Z`).toISOString())
    formData.append('notes', notes)

    if (file) {
      formData.append('report', file)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      await createBioimpedance(formData, {
        requestKey: null,
        fetch: (url: any, config: any) => fetch(url, { ...config, signal: controller.signal }),
      })
      clearInterval(interval)
      setUploadProgress(100)
      clearTimeout(timeoutId)
      setTimeout(() => {
        toast.success('Upload concluído com sucesso!')
        setOpen(false)
        resetForm()
      }, 500)
    } catch (err: any) {
      clearInterval(interval)
      clearTimeout(timeoutId)
      const fieldErrors = extractFieldErrors(err)
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) {
        if (err.isAbort || err.name === 'AbortError') {
          toast.error(
            'O tempo de conexão expirou. Por favor, tente novamente com uma conexão mais estável.',
          )
        } else if (err.status === 0 || err.status === 503) {
          toast.error(
            'O tempo de conexão expirou. Por favor, tente novamente com uma conexão mais estável.',
          )
        } else {
          toast.error(err.message || 'Ocorreu um erro inesperado.')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Bioimpedância</span>
            <span className="sm:hidden">Bio</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Avaliação de Bioimpedância</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bio-date">Data da Avaliação</Label>
            <Input
              id="bio-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-report">Arquivo (PDF, JPG, PNG)</Label>
            <Input
              id="bio-report"
              type="file"
              key={file ? file.name : 'empty'}
              accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null
                setFile(selectedFile)
                if (selectedFile && selectedFile.size > 20971520) {
                  setErrors((prev) => ({
                    ...prev,
                    report:
                      'O arquivo selecionado é muito grande. O limite máximo permitido é de 20MB.',
                  }))
                } else {
                  setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.report
                    return newErrors
                  })
                }
              }}
              disabled={isSubmitting}
            />
            {errors.report && <p className="text-sm text-destructive">{errors.report}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-notes">Observações</Label>
            <Textarea
              id="bio-notes"
              placeholder="Notas adicionais sobre a avaliação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
          </div>

          {isSubmitting && (
            <div className="space-y-1.5 py-2">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Enviando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting || !!errors.report}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Salvar Avaliação'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
