import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { searchUsers, createExameWithProgress } from '@/services/admin-exames'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Check, ChevronsUpDown, Search, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  usuario_id: z.string().min(1, 'Selecione um paciente'),
  nome_exame: z.string().min(1, 'O nome do exame é obrigatório'),
  tipo_exame: z.enum(['sangue', 'imagem', 'outro'], {
    required_error: 'Selecione o tipo de exame',
  }),
  data_exame: z.string().min(1, 'A data é obrigatória'),
  arquivo: z
    .instanceof(File, { message: 'O arquivo PDF é obrigatório' })
    .refine((f) => f.size <= 500 * 1024 * 1024, 'Arquivo muito grande, máx 500MB')
    .refine((f) => f.type === 'application/pdf', 'Apenas arquivos PDF são permitidos'),
})

export function ExameUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [openUser, setOpenUser] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome_exame: '', data_exame: '' },
  })

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(userSearch).then((res) => setUsers(res.items)), 300)
    return () => clearTimeout(timer)
  }, [userSearch])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true)
    try {
      await createExameWithProgress(values, setProgress)
      toast({ title: 'Sucesso', description: 'Exame enviado com sucesso.' })
      setOpen(false)
      form.reset()
      setSelectedUser(null)
      setProgress(0)
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Novo Exame
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload de Exame PDF</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="usuario_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Paciente</FormLabel>
                  <Popover open={openUser} onOpenChange={setOpenUser}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'justify-between font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {selectedUser ? selectedUser.name : 'Buscar paciente...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                      <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 opacity-50" />
                        <input
                          className="flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          placeholder="Digite o nome..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-64 p-1">
                        {users.map((u) => (
                          <div
                            key={u.id}
                            className={cn(
                              'flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm hover:bg-accent',
                              field.value === u.id && 'bg-accent',
                            )}
                            onClick={() => {
                              field.onChange(u.id)
                              setSelectedUser(u)
                              setOpenUser(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === u.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {u.name}{' '}
                            <span className="ml-1 text-xs text-muted-foreground">({u.email})</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome_exame"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Exame</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Hemograma" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
            </div>
            <FormField
              control={form.control}
              name="data_exame"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Exame</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arquivo"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Arquivo PDF (Max 500MB)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2 [&>div]:bg-primary" />
                <p className="text-xs text-center text-muted-foreground">{progress}% concluído</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isUploading}
            >
              {isUploading ? 'Enviando...' : 'Salvar Exame'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
