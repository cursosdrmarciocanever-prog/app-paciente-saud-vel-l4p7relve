import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  createCatalogoInjetavel,
  updateCatalogoInjetavel,
  type CatalogoInjetavel,
} from '@/services/catalogo'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  produto: z.string().min(1, 'Produto é obrigatório'),
  tipo: z.string().optional(),
  funcao: z.string().optional(),
  via_administracao: z.string().optional(),
  ponsologia_recomendada: z.string().optional(),
  composicao: z.string().optional(),
  valor: z.coerce.number().min(0).optional(),
  ativo: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onClose: () => void
  item?: CatalogoInjetavel | null
  onSuccess: () => void
}

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function CatalogoFormModal({ open, onClose, item, onSuccess }: Props) {
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produto: '',
      tipo: '',
      funcao: '',
      via_administracao: '',
      ponsologia_recomendada: '',
      composicao: '',
      valor: 0,
      ativo: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          produto: item.produto,
          tipo: item.tipo || '',
          funcao: item.funcao || '',
          via_administracao: item.via_administracao || '',
          ponsologia_recomendada: item.ponsologia_recomendada || '',
          composicao: item.composicao || '',
          valor: item.valor || 0,
          ativo: item.ativo !== false,
        })
      } else {
        form.reset({
          produto: '',
          tipo: '',
          funcao: '',
          via_administracao: '',
          ponsologia_recomendada: '',
          composicao: '',
          valor: 0,
          ativo: true,
        })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: FormData) => {
    try {
      if (item) {
        await updateCatalogoInjetavel(item.id, values)
        toast({ title: 'Atualizado com sucesso' })
      } else {
        await createCatalogoInjetavel(values)
        toast({ title: 'Criado com sucesso' })
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item do Catálogo' : 'Novo Item do Catálogo'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="produto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <FormControl>
                    <input className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <input className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="funcao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <input className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="composicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Composição (kits) — um ativo por linha</FormLabel>
                  <FormControl>
                    <textarea
                      className={inputClass + ' min-h-[100px] resize-y'}
                      placeholder={'NMN Mono Nicot 100mg/1mL\nAlfa GPC (98%) 150mg/1mL\n...'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="via_administracao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Via Admin.</FormLabel>
                  <FormControl>
                    <input className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <input type="number" step="0.01" className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-8">
                    <FormLabel>Ativo</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
