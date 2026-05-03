import { useEffect, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers, requestPasswordReset, createUser, updateUser } from '@/services/users'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
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

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome muito curto').optional().or(z.literal('')),
  role: z.enum(['admin', 'financeiro', 'paciente']),
})

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const loadUsers = () => getUsers().then(setUsers)
  useEffect(() => {
    loadUsers()
  }, [])
  useRealtime('users', loadUsers)

  const filteredUsers = useMemo(() => {
    let res = users
    if (search)
      res = res.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    if (roleFilter !== 'all') res = res.filter((u) => u.role === roleFilter)
    return res
  }, [users, search, roleFilter])

  const paginatedUsers = filteredUsers.slice((page - 1) * 10, page * 10)

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { email: '', name: '', role: 'paciente' },
  })

  useEffect(() => {
    if (editingUser)
      form.reset({ email: editingUser.email, name: editingUser.name || '', role: editingUser.role })
    else form.reset({ email: '', name: '', role: 'paciente' })
  }, [editingUser, open, form])

  const handleReset = async (email: string) => {
    try {
      await requestPasswordReset(email)
      toast({ title: 'Email enviado', description: 'Link de reset enviado com sucesso.' })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar reset de senha.',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (data: any) => {
    try {
      if (editingUser) await updateUser(editingUser.id, data)
      else await createUser(data)
      toast({ title: 'Sucesso', description: 'Usuário salvo com sucesso.' })
      setOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao salvar.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) setEditingUser(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>Adicionar Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paciente">Paciente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paciente">Paciente</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Criação</TableHead>
              <TableHead>Status Pgto</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.name || '-'}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{new Date(u.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{u.is_paid ? 'Pago' : 'Pendente'}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(u)
                        setOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleReset(u.email)}>
                      Reset Senha
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <Button
          variant="outline"
          disabled={page * 10 >= filteredUsers.length}
          onClick={() => setPage((p) => p + 1)}
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}
