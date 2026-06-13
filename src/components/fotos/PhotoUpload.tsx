import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { uploadFoto } from '@/services/fotos'
import { Trash2, UploadCloud, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { z } from 'zod'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  currentCount: number
  maxPhotos: number
  onSuccess: () => void
}

const uploadSchema = z.object({
  file: z
    .custom<File>((v) => v instanceof File, 'Por favor, selecione um arquivo válido')
    .refine((f) => ['image/jpeg', 'image/png'].includes(f.type), 'Apenas JPG ou PNG são permitidos')
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Arquivo muito grande, máx 5MB'),
})

export function PhotoUpload({ currentCount, maxPhotos, onSuccess }: PhotoUploadProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [descricao, setDescricao] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const isFull = currentCount >= maxPhotos

  const handleFile = (file: File) => {
    if (isFull) {
      setError('Limite atingido')
      return
    }
    const result = uploadSchema.safeParse({ file })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    setError(null)
    setSelectedFile(file)
  }

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return
    setUploading(true)
    setProgress(0)
    setError(null)

    const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 200)

    try {
      const formData = new FormData()
      formData.append('usuario_id', user.id)
      formData.append('foto', selectedFile)
      if (descricao) formData.append('descricao', descricao)

      await uploadFoto(formData)
      setProgress(100)
      toast({ title: 'Sucesso', description: 'Foto enviada com sucesso!' })
      setSelectedFile(null)
      setDescricao('')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar foto.')
    } finally {
      clearInterval(interval)
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#4A4A4A]">Minhas Fotos</CardTitle>
        <CardDescription className="text-[#4A4A4A]/80">
          Acompanhe sua evolução com fotos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-[#4A4A4A]">Uso de armazenamento</span>
          <span className={isFull ? 'text-destructive' : 'text-muted-foreground'}>
            {currentCount} / {maxPhotos} fotos
          </span>
        </div>
        <Progress value={(currentCount / maxPhotos) * 100} className="h-2" />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription className="flex items-center justify-between mt-2">
              <span>{error}</span>
              {error !== 'Limite atingido' && (
                <Button variant="outline" size="sm" onClick={() => setError(null)}>
                  Tentar Novamente
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={() => !isFull && !uploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors relative',
            dragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
            isFull || uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#4A4A4A]">
                Arraste fotos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">Apenas JPG ou PNG. Máx. 5MB.</p>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="bg-secondary p-4 rounded-lg space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center shrink-0 shadow-sm">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#4A4A4A] truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Descrição da foto (opcional)</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={uploading}
                rows={2}
                className="resize-none focus-visible:ring-primary"
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#4A4A4A] font-medium">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" /> Processando...
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1 bg-primary/20 [&>div]:bg-primary" />
              </div>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Enviar Foto'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
