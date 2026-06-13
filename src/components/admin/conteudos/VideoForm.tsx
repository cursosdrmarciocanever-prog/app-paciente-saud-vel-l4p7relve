import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { Categoria, Video } from '@/services/conteudo'

const formSchema = z.object({
  titulo: z.string().min(10, 'Mínimo de 10 caracteres'),
  descricao: z.string().min(20, 'Mínimo de 20 caracteres'),
  url_youtube: z
    .string()
    .url('Deve ser uma URL válida')
    .regex(/^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/, 'URL do YouTube inválida'),
  categoria_id: z.string().min(1, 'Selecione uma categoria'),
  duracao_minutos: z.number().int().min(0).optional(),
  publicado: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  initialData?: Partial<Video>
  categorias: Categoria[]
  onSubmit: (data: FormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function VideoForm({ initialData, categorias, onSubmit, onCancel, isSubmitting }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: initialData?.titulo ?? '',
      descricao: initialData?.descricao ?? '',
      url_youtube: initialData?.url_youtube ?? '',
      categoria_id: initialData?.categoria_id ?? '',
      duracao_minutos: initialData?.duracao_minutos ?? undefined,
      publicado: initialData?.publicado ?? false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título do vídeo" {...field} />
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Breve resumo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url_youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do YouTube</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/watch?v=..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoria_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id!}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duracao_minutos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração (minutos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 15"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Publicado</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#D4A574] text-white hover:bg-[#c29567]"
          >
            Salvar Vídeo
          </Button>
        </div>
      </form>
    </Form>
  )
}
