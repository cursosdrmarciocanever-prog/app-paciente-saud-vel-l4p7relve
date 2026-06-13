import { CatalogoTable } from '@/components/dashboard/CatalogoTable'

export default function LojaInjetaveis() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Catálogo de Injetáveis</h1>
        <p className="text-muted-foreground mt-2">
          Consulte nossa tabela de tratamentos e agende sua aplicação diretamente.
        </p>
      </div>

      <CatalogoTable hideHeader={true} />
    </div>
  )
}
