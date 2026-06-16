import { useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UploadCloud, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

// CPF (11 dígitos) no nome do arquivo, se houver
function cpfFromFilename(name: string): string {
  const m = name.replace(/\.[^.]+$/, '').replace(/[.\-\s]/g, '').match(/\d{11}/)
  return m ? m[0] : ''
}

const schema = z.object({
  cpf: z
    .string()
    .refine((v) => v.replace(/\D/g, '').length === 11, 'Informe um CPF válido (11 dígitos)'),
  descricao: z.string().optional(),
  foto: z
    .any()
    .refine((f) => f instanceof File, 'Selecione uma imagem')
    .refine((f) => f?.size <= MAX_FILE_SIZE, 'Imagem muito grande, máx 5MB')
    .refine((f) => f?.type?.startsWith('image/'), 'Apenas imagens são aceitas'),
})

export function FotoUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { cpf: '', descricao: '' },
  })

  const aplicarFoto = (file: File) => {
    form.setValue('foto', file, { shouldValidate: true })
    const atual = (form.getValues('cpf') || '').replace(/\D/g, '')
    if (atual.length !== 11) {
      const cpf = cpfFromFilename(file.name)
      if (cpf) form.setValue('cpf', maskCpf(cpf), { shouldValidate: true })
    }
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('cpf', values.cpf.replace(/\D/g, ''))
      if (values.descricao) fd.append('descricao', values.descricao)
      fd.append('foto', values.foto)
      await pb.collection('fotos_paciente').create(fd)

      toast({ title: 'Foto anexada', description: 'Vinculada ao paciente (ou pendente pelo CPF).' })
      form.reset({ cpf: '', descricao: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      onSuccess()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível anexar a foto.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-primary">Anexar foto por CPF</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF do Paciente *</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    {...field}
                    onChange={(e) => field.onChange(maskCpf(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Frente - Mês 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="foto"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Imagem (máx. 5MB) *</FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center',
                      field.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50',
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const f = e.dataTransfer.files?.[0]
                      if (f) aplicarFoto(f)
                    }}
                  >
                    {field.value ? (
                      <ImageIcon className="h-6 w-6 text-primary mb-1" />
                    ) : (
                      <UploadCloud className="h-6 w-6 text-muted-foreground mb-1" />
                    )}
                    <p className="text-xs">
                      {field.value ? (field.value as File).name : 'Arraste ou clique'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) aplicarFoto(f)
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-3">
            <p className="text-xs text-muted-foreground mb-2">
              Vincula automaticamente ao paciente com este CPF. Se ele ainda não tiver conta, a foto
              fica arquivada e é vinculada quando ele se cadastrar com este CPF.
            </p>
            <Button type="submit" disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Enviando...' : 'Anexar Foto'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
