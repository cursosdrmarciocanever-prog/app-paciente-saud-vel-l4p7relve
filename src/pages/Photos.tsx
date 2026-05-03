import { useState, useEffect } from 'react'
import {
  getEvolutionPhotos,
  createEvolutionPhoto,
  getPhotoUrl,
  EvolutionPhotoRecord,
} from '@/services/evolution_photos'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { Image as ImageIcon, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { LockedFeature } from '@/components/LockedFeature'

export default function Photos() {
  const { user } = useAuth()
  const [records, setRecords] = useState<EvolutionPhotoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [date, setDate] = useState('')
  const [angle, setAngle] = useState<'Frente' | 'Lado' | 'Costas' | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const loadData = async () => {
    try {
      const data = await getEvolutionPhotos()
      setRecords(data)
    } catch (err) {
      toast.error('Erro ao carregar fotos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('evolution_photos', () => {
    loadData()
  })

  if (!user?.is_paid) {
    return <LockedFeature title="Galeria de Fotos" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!user) return
    if (!date) {
      setErrors({ date: 'Data é obrigatória' })
      return
    }
    if (!angle) {
      setErrors({ angle: 'Ângulo é obrigatório' })
      return
    }
    if (!file) {
      setErrors({ photo: 'Foto é obrigatória' })
      return
    }

    if (file.size > 20971520) {
      setErrors({
        photo: 'O arquivo selecionado é muito grande. O limite máximo permitido é de 20MB.',
      })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setErrors({
        photo: 'Formato de arquivo não suportado. Por favor, envie um PDF ou imagem (PNG/JPG).',
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('user', user.id)
    // Para evitar problemas de fuso horário, definimos a hora para o meio-dia UTC
    formData.append('date', new Date(`${date}T12:00:00Z`).toISOString())
    formData.append('angle', angle)
    formData.append('photo', file)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      await createEvolutionPhoto(formData, {
        requestKey: null,
        fetch: (url: any, config: any) => fetch(url, { ...config, signal: controller.signal }),
      })
      clearInterval(interval)
      setUploadProgress(100)
      clearTimeout(timeoutId)
      setTimeout(() => {
        toast.success('Upload concluído com sucesso!')
        setOpen(false)
        setDate('')
        setAngle('')
        setFile(null)
        setUploadProgress(0)
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
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Galeria de Fotos</h1>
        </div>

        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) {
              setDate('')
              setAngle('')
              setFile(null)
              setErrors({})
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Foto de Evolução</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data da Foto</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ângulo</Label>
                <Select
                  value={angle}
                  onValueChange={(val: any) => setAngle(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ângulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frente">Frente</SelectItem>
                    <SelectItem value="Lado">Lado</SelectItem>
                    <SelectItem value="Costas">Costas</SelectItem>
                  </SelectContent>
                </Select>
                {errors.angle && <p className="text-sm text-destructive">{errors.angle}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Arquivo (JPG, PNG)</Label>
                <Input
                  id="photo"
                  type="file"
                  key={file ? file.name : 'empty'}
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null
                    setFile(selectedFile)
                    if (selectedFile && selectedFile.size > 20971520) {
                      setErrors((prev) => ({
                        ...prev,
                        photo:
                          'O arquivo selecionado é muito grande. O limite máximo permitido é de 20MB.',
                      }))
                    } else {
                      setErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.photo
                        return newErrors
                      })
                    }
                  }}
                  disabled={isSubmitting}
                />
                {errors.photo && <p className="text-sm text-destructive">{errors.photo}</p>}
              </div>

              {isSubmitting && (
                <div className="space-y-1.5 py-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Enviando foto...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || !!errors.photo}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Salvar Foto'
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
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhuma foto de evolução encontrada.</p>
            <p className="text-sm mt-1">Acompanhe seu progresso visual adicionando fotos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {records.map((record) => {
            const url = getPhotoUrl(record.id, record.photo)
            return (
              <Card
                key={record.id}
                className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all ring-1 ring-border/50"
                onClick={() => setSelectedPhoto(url)}
              >
                <div className="aspect-[3/4] relative bg-muted/50">
                  {url ? (
                    <img
                      src={url}
                      alt={`Evolução ${record.angle}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-semibold text-sm drop-shadow-md">
                      {format(new Date(record.date), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-white/90 text-xs font-medium drop-shadow-md mt-0.5">
                      {record.angle}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-[101] text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </Button>
          <img
            src={selectedPhoto}
            alt="Foto expandida"
            className="max-w-full max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  )
}
