import { Edit, Trash, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Categoria } from '@/services/conteudo'

export interface ContentItem {
  id?: string
  titulo: string
  categoria_id: string
  publicado: boolean
  visualizacoes: number
  [key: string]: any
}

interface Props {
  items: ContentItem[]
  categorias: Categoria[]
  onEdit: (item: ContentItem) => void
  onDelete: (id: string) => void
  onView: (item: ContentItem) => void
}

export function ContentList({ items, categorias, onEdit, onDelete, onView }: Props) {
  const getCatName = (id: string) => categorias.find((c) => c.id === id)?.nome || 'Desconhecida'

  return (
    <div className="w-full">
      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <h4 className="mb-2 font-semibold leading-none tracking-tight">{item.titulo}</h4>
            <div className="mb-4 text-sm text-muted-foreground">
              {getCatName(item.categoria_id)} • {item.visualizacoes} visualizações
            </div>
            <div className="mb-4">
              <Badge
                variant={item.publicado ? 'default' : 'secondary'}
                className={item.publicado ? 'bg-[#D4A574] hover:bg-[#c29567]' : ''}
              >
                {item.publicado ? 'Publicado' : 'Rascunho'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onView(item)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(item.id!)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border py-8 text-center text-muted-foreground">
            Nenhum conteúdo encontrado.
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Visualizações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum conteúdo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.titulo}</TableCell>
                  <TableCell>{getCatName(item.categoria_id)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.publicado ? 'default' : 'secondary'}
                      className={item.publicado ? 'bg-[#D4A574] hover:bg-[#c29567]' : ''}
                    >
                      {item.publicado ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.visualizacoes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(item.id!)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
