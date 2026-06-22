import { useState } from 'react'
import { PrateleiraInjetaveis } from '@/components/dashboard/PrateleiraInjetaveis'
import { CatalogoTable } from '@/components/dashboard/CatalogoTable'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Table as TableIcon } from 'lucide-react'

export default function LojaInjetaveis() {
  const [modo, setModo] = useState<'prateleira' | 'tabela'>('prateleira')

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loja de Injetáveis</h1>
          <p className="text-muted-foreground mt-2">
            Conheça os suplementos injetáveis, suas funções e valores. Compre direto pelo app.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Button
            variant={modo === 'prateleira' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setModo('prateleira')}
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" /> Prateleira
          </Button>
          <Button
            variant={modo === 'tabela' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setModo('tabela')}
          >
            <TableIcon className="h-4 w-4 mr-1.5" /> Tabela
          </Button>
        </div>
      </div>

      {modo === 'prateleira' ? <PrateleiraInjetaveis /> : <CatalogoTable hideHeader={true} />}
    </div>
  )
}
