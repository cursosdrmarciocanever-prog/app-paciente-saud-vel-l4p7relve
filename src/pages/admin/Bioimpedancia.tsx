import { useState } from 'react'
import { BioimpedanciaForm } from '@/components/admin/bioimpedancia/BioimpedanciaForm'
import { BioimpedanciaList } from '@/components/admin/bioimpedancia/BioimpedanciaList'

export default function BioimpedanciaAdmin() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Gerenciar Bioimpedância dos Pacientes
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload de PDFs e métricas de bioimpedância para acompanhamento clínico.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-1 sticky top-6">
          <BioimpedanciaForm onSuccess={() => setRefreshTrigger((p) => p + 1)} />
        </div>
        <div className="xl:col-span-2 min-h-[500px]">
          <BioimpedanciaList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}
