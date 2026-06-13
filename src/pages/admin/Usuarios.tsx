import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Loader2,
  FilterX,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  Gift,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import {
  getAdminUsuarios,
  updateAssinaturaStatus,
  deleteAdminUsuario,
  activateBonusSubscription,
  type AdminUserMerged,
} from '@/services/admin-usuarios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type SortColumn = 'name' | 'email' | 'plano' | 'status' | 'created'
type SortDirection = 'asc' | 'desc'

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ativo':
      return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
    case 'suspenso':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200'
  }
}

export default function AdminUsuarios() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUserMerged[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<SortColumn>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedUser, setSelectedUser] = useState<AdminUserMerged | null>(null)
  const [userToDelete, setUserToDelete] = useState<AdminUserMerged | null>(null)
  const [userToActivateBonus, setUserToActivateBonus] = useState<AdminUserMerged | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAdminUsuarios()
      setUsers(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const query = debouncedSearch.toLowerCase()
        const matchesSearch =
          user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        const matchesStatus =
          statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const valA = a[sortColumn] || ''
        const valB = b[sortColumn] || ''
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
  }, [users, debouncedSearch, statusFilter, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 20))
  const paginatedUsers = filteredUsers.slice((page - 1) * 20, page * 20)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPage(1)
  }

  const handleStatusChange = async (assinaturaId: string, newStatus: string) => {
    setLoading(true)
    try {
      await updateAssinaturaStatus(assinaturaId, newStatus)
      toast({ title: 'Sucesso', description: `Status alterado para ${newStatus}.` })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    setLoading(true)
    try {
      await deleteAdminUsuario(userToDelete.id)
      toast({ title: 'Sucesso', description: 'Usuário deletado com sucesso.' })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o usuário.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setUserToDelete(null)
    }
  }

  const handleActivateBonus = async () => {
    if (!userToActivateBonus) return
    setLoading(true)
    try {
      await activateBonusSubscription(userToActivateBonus.id)
      toast({
        title: 'Sucesso',
        description: `Assinatura bônus ativada com sucesso para ${userToActivateBonus.name || 'o usuário'}!`,
      })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar a assinatura bônus.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setUserToActivateBonus(null)
    }
  }

  const SortableHead = ({ column, label }: { column: SortColumn; label: string }) => (
    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort(column)}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
    </TableHead>
  )

  const UserActions = ({ user }: { user: AdminUserMerged }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
          <Eye className="mr-2 h-4 w-4" /> Detalhes
        </DropdownMenuItem>
        {user.status.toLowerCase() === 'ativo' && user.assinatura_id && (
          <DropdownMenuItem onClick={() => handleStatusChange(user.assinatura_id, 'Suspenso')}>
            <Ban className="mr-2 h-4 w-4 text-amber-600" /> Suspender
          </DropdownMenuItem>
        )}
        {user.status.toLowerCase() === 'suspenso' && user.assinatura_id && (
          <DropdownMenuItem onClick={() => handleStatusChange(user.assinatura_id, 'Ativo')}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Reativar
          </DropdownMenuItem>
        )}
        {user.status.toLowerCase() !== 'ativo' && (
          <DropdownMenuItem onClick={() => setUserToActivateBonus(user)}>
            <Gift className="mr-2 h-4 w-4 text-purple-600" /> Ativar Bônus
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setUserToDelete(user)} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" /> Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-[#4A4A4A]">Gestão de Usuários</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters} title="Limpar Filtros">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead column="name" label="Nome" />
                  <SortableHead column="email" label="Email" />
                  <SortableHead column="plano" label="Plano" />
                  <SortableHead column="status" label="Status" />
                  <SortableHead column="created" label="Data Cadastro" />
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.plano}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created)}</TableCell>
                      <TableCell>
                        <UserActions user={user} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white rounded-md border">
                Nenhum usuário encontrado.
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="overflow-hidden mr-2">
                        <p className="font-medium text-base truncate">{user.name || '-'}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <UserActions user={user} />
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="text-gray-500">Status</span>
                      <Badge variant="outline" className={getStatusBadgeClass(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Plano</span>
                      <span>{user.plano}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Cadastro</span>
                      <span>{formatDate(user.created)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage((p) => p - 1)
                    }}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-gray-500 mx-4">
                    Página {page} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage((p) => p + 1)
                    }}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-base">{selectedUser.name || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plano</p>
                  <p className="text-base">{selectedUser.plano}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant="outline" className={getStatusBadgeClass(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                  <p className="text-base">{formatDate(selectedUser.created)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Última Consulta</p>
                  <p className="text-base">
                    {selectedUser.ultima_consulta ? formatDate(selectedUser.ultima_consulta) : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bonus Confirmation Modal */}
      <AlertDialog
        open={!!userToActivateBonus}
        onOpenChange={(open) => !open && setUserToActivateBonus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ativar Assinatura Bônus</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja ativar o acesso bônus para este paciente? Esta ação não requer cartão de
              crédito e concederá acesso imediato à Biblioteca de Saúde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivateBonus}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Sim, ativar bônus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário{' '}
              <span className="font-semibold text-gray-900">{userToDelete?.name}</span> e todos os
              seus dados vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, deletar usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
