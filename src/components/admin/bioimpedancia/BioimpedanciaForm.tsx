import { useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, UploadCloud, Loader2, FileText } from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// Formata o CPF como 000.000.000-00 enquanto digita (aceita só dígitos)
function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

const formSchema = z.object({
  cpf: z
    .string()
    .refine((v) => v.replace(/\D/g, '').length === 11, 'Informe um CPF válido (11 dígitos)'),
  data_medicao: z.date({ required_error: 'Selecione a data da medição' }),
  massa_magra: z.string().optional(),
  percentual_gordura: z.string().optional(),
  arquivo: z
    .any()
    .refine((file) => file instanceof File, 'Selecione um arquivo PDF')
    .refine((file) => file?.size <= MAX_FILE_SIZE, 'Arquivo muito grande, máx 500MB')
    .refine((file) => file?.type === 'application/pdf', 'Apenas arquivos PDF são aceitos'),
})

export function BioimpedanciaForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpf: '',
      massa_magra: '',
      percentual_gordura: '',
      data_medicao: new Date(),
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      formData.append('cpf', values.cpf.replace(/\D/g, ''))
      formData.append('data_medicao', values.data_medicao.toISOString())
      if (values.massa_magra && !isNaN(Number(values.massa_magra))) {
        formData.append('massa_magra', Number(values.massa_magra).toString())
      }
      if (values.percentual_gordura && !isNaN(Number(values.percentual_gordura))) {
        formData.append('percentual_gordura', Number(values.percentual_gordura).toString())
      }
      formData.append('arquivo', values.arquivo)
      formData.append('tamanho_bytes', values.arquivo.size.toString())

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
          else reject(new Error('Erro no upload do arquivo.'))
        })
        xhr.addEventListener('error', () => reject(new Error('Erro de conexão ao enviar arquivo.')))
        xhr.open('POST', pb.buildUrl('/api/collections/bioimpedancia_pdf/records'))
        xhr.setRequestHeader('Authorization', pb.authStore.token)
        xhr.send(formData)
      })

      toast({ title: 'Sucesso', description: 'Exame de bioimpedância salvo com sucesso.' })
      form.reset()
      if (fileInputRef.current) fileInputRef.current.value = ''
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) form.setValue('arquivo', file, { shouldValidate: true })
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-primary">Novo Exame</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>CPF do Paciente *</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    {...field}
                    onChange={(e) => field.onChange(maskCpf(e.target.value))}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Vincula automaticamente ao paciente com este CPF. Se ele ainda não tiver conta, o
                  exame fica arquivado e é vinculado quando ele se cadastrar com este CPF.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data_medicao"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Medição *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="massa_magra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Massa Magra (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="Ex: 35.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentual_gordura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gordura (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="Ex: 15.2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="arquivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo PDF (Máx. 500MB) *</FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors',
                      field.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50',
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files?.[0]
                      if (file) form.setValue('arquivo', file, { shouldValidate: true })
                    }}
                  >
                    {field.value ? (
                      <FileText className="h-8 w-8 text-primary mb-2" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm font-medium text-center">
                      {field.value
                        ? (field.value as File).name
                        : 'Arraste o PDF aqui ou clique para selecionar'}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </FormControl>
                {isUploading && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Enviando arquivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Salvando...' : 'Salvar Exame'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
