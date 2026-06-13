import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FotosTab } from '@/components/admin/dashboard/FotosTab'
import { ExamesTab } from '@/components/admin/dashboard/ExamesTab'
import { BioimpedanciaTab } from '@/components/admin/dashboard/BioimpedanciaTab'
import { PedidosTab } from '@/components/admin/dashboard/PedidosTab'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-800">Gerenciar Conteúdo dos Pacientes</h2>
        <p className="text-sm text-slate-500">
          Acompanhe e gerencie fotos, exames, relatórios e pedidos.
        </p>
      </div>

      <Tabs defaultValue="fotos" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-100 p-1 rounded-lg h-auto">
          <TabsTrigger
            value="fotos"
            className="py-2 text-[#4A4A4A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-colors"
          >
            Fotos
          </TabsTrigger>
          <TabsTrigger
            value="exames"
            className="py-2 text-[#4A4A4A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-colors"
          >
            Exames
          </TabsTrigger>
          <TabsTrigger
            value="bioimpedancia"
            className="py-2 text-[#4A4A4A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-colors"
          >
            Bioimpedância
          </TabsTrigger>
          <TabsTrigger
            value="pedidos"
            className="py-2 text-[#4A4A4A] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-none transition-colors"
          >
            Pedidos Injetáveis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fotos" className="focus-visible:outline-none">
          <FotosTab />
        </TabsContent>
        <TabsContent value="exames" className="focus-visible:outline-none">
          <ExamesTab />
        </TabsContent>
        <TabsContent value="bioimpedancia" className="focus-visible:outline-none">
          <BioimpedanciaTab />
        </TabsContent>
        <TabsContent value="pedidos" className="focus-visible:outline-none">
          <PedidosTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
