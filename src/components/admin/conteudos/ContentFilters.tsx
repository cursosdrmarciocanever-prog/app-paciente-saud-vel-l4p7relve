import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Categoria } from '@/services/conteudo'

interface Props {
  search: string
  onSearchChange: (s: string) => void
  categoria: string
  onCategoriaChange: (c: string) => void
  status: string
  onStatusChange: (s: string) => void
  categorias: Categoria[]
  onAdd: () => void
  addButtonText: string
}

export function ContentFilters({
  search,
  onSearchChange,
  categoria,
  onCategoriaChange,
  status,
  onStatusChange,
  categorias,
  onAdd,
  addButtonText,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            className="pl-8"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={categoria} onValueChange={onCategoriaChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id!}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onAdd}
        className="w-full bg-[#D4A574] text-white hover:bg-[#c29567] md:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" /> {addButtonText}
      </Button>
    </div>
  )
}
