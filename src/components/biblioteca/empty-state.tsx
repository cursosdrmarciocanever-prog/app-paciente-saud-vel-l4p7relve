import { Search } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20 border-dashed">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium">Nenhum conteúdo disponível</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Não encontramos resultados para a sua busca ou filtros atuais. Tente mudar os termos de
        pesquisa.
      </p>
    </div>
  )
}
