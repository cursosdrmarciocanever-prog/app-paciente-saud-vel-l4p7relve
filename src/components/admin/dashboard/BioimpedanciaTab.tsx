import { useState } from 'react'
import { BioimpedanciaForm } from '@/components/admin/bioimpedancia/BioimpedanciaForm'
import { BioimpedanciaList } from '@/components/admin/bioimpedancia/BioimpedanciaList'

// Aba de Bioimpedância do dashboard admin: reaproveita o formulário de upload
// por CPF e a lista (que já tem busca por CPF) da seção dedicada.
export function BioimpedanciaTab() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      <div className="xl:col-span-1 xl:sticky xl:top-6">
        <BioimpedanciaForm onSuccess={() => setRefreshTrigger((p) => p + 1)} />
      </div>
      <div className="xl:col-span-2 min-h-[400px]">
        <BioimpedanciaList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
