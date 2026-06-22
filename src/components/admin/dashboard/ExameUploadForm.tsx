import { useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UploadCloud, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const aceitaArquivo = (f: File) => f.type.startsWith('image/') || f.type === 'application/pdf'

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function cpfFromFilename(name: string): string {
  const m = name.replace(/\.[^.]+$/, '').replace(/[.\-\s]/g, '').match(/\d{11}/)
  return m ? m[0] : ''
}

const schema = z.object({
  cpf: z
    .string()
    .refine((v) => v.replace(/\D/g, '').length === 11, 'Informe um CPF válido (11 dígitos)'),
  nome_exame: z.string().min(1, 'Informe o nome do exame'),
  data_exame: z.string().optional(),
  tipo_exame: z.enum(['sangue', 'imagem', 'outro']).default('outro'),
  arquivo: z
    .any()
    .refine((f) => f instanceof File, 'Selecione um arquivo')
    .refine((f) => f?.size <= MAX_FILE_SIZE, 'Arquivo muito grande')
    .refine((f) => f && aceitaArquivo(f), 'Apenas imagens ou PDF são aceitos'),
})

export function ExameUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { cpf: '', nome_exame: '', data_exame: '', tipo_exame: 'outro' },
  })

  const aplicarArquivo = (file: File) => {
    form.setValue('arquivo', file, { shouldValidate: true })
    const atual = (form.getValues('cpf') || '').replace(/\D/g, '')
    if (atual.length !== 11) {
      const cpf = cpfFromFilename(file.name)
      if (cpf) form.setValue('cpf', maskCpf(cpf), { shouldValidate: true })
    }
    if (!form.getValues('nome_exame')) {
      form.setValue('nome_exame', file.name.replace(/\.[^.]+$/, ''), { shouldValidate: true })
    }
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('cpf', values.cpf.replace(/\D/g, ''))
      fd.append('nome_exame', values.nome_exame)
      fd.append('tipo_exame', values.tipo_exame)
      if (values.data_exame) {
        const [y, m, d] = values.data_exame.split('-')
        fd.append('data_exame', new Date(Number(y), Number(m) - 1, Number(d), 12).toISOString())
      }
      fd.append('arquivo', values.arquivo)
      await pb.collection('exames_pdf').create(fd)

      toast({ title: 'Exame anexado', description: 'Vinculado ao paciente (ou pendente pelo CPF).' })
      form.reset({ cpf: '', nome_exame: '', data_exame: '', tipo_exame: 'outro' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      onSuccess()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível anexar o exame.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-primary">Anexar exame por CPF</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="nome_exame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do exame *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Hemograma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data_exame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do exame</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo_exame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sangue">Sangue</SelectItem>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arquivo"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Arquivo (PDF ou imagem) *</FormLabel>
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
                      if (f) aplicarArquivo(f)
                    }}
                  >
                    {field.value ? (
                      <FileText className="h-6 w-6 text-primary mb-1" />
                    ) : (
                      <UploadCloud className="h-6 w-6 text-muted-foreground mb-1" />
                    )}
                    <p className="text-xs">
                      {field.value ? (field.value as File).name : 'Arraste ou clique'}
                    </p>
                    <input
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) aplicarArquivo(f)
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground mb-2">
              Vincula automaticamente ao paciente com este CPF. Se ele ainda não tiver conta, o exame
              fica arquivado e é vinculado quando ele se cadastrar com este CPF.
            </p>
            <Button type="submit" disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Enviando...' : 'Anexar Exame'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
