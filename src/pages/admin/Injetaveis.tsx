import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { CatalogoTable } from '@/components/dashboard/CatalogoTable'
import { PedidosCatalogoAdmin } from '@/components/admin/PedidosCatalogoAdmin'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import pb from '@/lib/pocketbase/client'

export default function AdminInjetaveis() {
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const { user } = useAuth()
  const isAdmin =
    user?.email === 'admin@canever.com.br' || user?.email === 'marciocanever@hotmail.com'
  const importInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.toLowerCase()

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        setImporting(true)
        let payload: any = {}
        const resultText = (evt.target?.result as string) || ''

        if (fileName.endsWith('.json')) {
          const parsed = JSON.parse(resultText)
          payload = { items: Array.isArray(parsed) ? parsed : [parsed] }
        } else if (fileName.endsWith('.csv')) {
          const lines = resultText.split(/\r?\n/).filter((l) => l.trim())
          if (lines.length > 0) {
            const separator = lines[0].includes(';') ? ';' : ','
            const headers = lines[0]
              .split(separator)
              .map((h) => h.trim().replace(/^["']|["']$/g, ''))
            const parsed = []
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue
              const values = lines[i]
                .split(separator)
                .map((v) => v.trim().replace(/^["']|["']$/g, ''))
              const obj: any = {}
              headers.forEach((h, idx) => {
                obj[h] = values[idx]
              })
              parsed.push(obj)
            }
            payload = { items: parsed }
          } else {
            throw new Error('Arquivo CSV vazio')
          }
        } else {
          throw new Error('Formato não suportado. Use .json ou .csv')
        }

        const { importCatalogoInjetaveis } = await import('@/services/catalogo')
        const result = await importCatalogoInjetaveis(payload)

        toast({
          title: 'Sucesso',
          description: `${result.imported} produtos importados para o catálogo.`,
        })
        setImportModalOpen(false)
      } catch (err: any) {
        toast({
          title: 'Erro na Importação',
          description:
            err.message ||
            err.response?.message ||
            'Falha ao importar. Verifique o formato do arquivo.',
          variant: 'destructive',
        })
      } finally {
        setImporting(false)
        if (importInputRef.current) importInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4A4A4A]">Catálogo de Injetáveis</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os produtos disponíveis e seus valores
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar em Bloco
            </Button>
          )}
        </div>
      </div>

      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Catálogo de Injetáveis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">
              Faça upload de um arquivo CSV (.csv) ou JSON (.json) para importar múltiplos produtos.
              Colunas suportadas:{' '}
              <strong>
                Produto, Tipo, Função, Via de Administração, Posologia Recomendada, Valor
              </strong>
              .
            </p>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold">Clique para upload</span> ou arraste
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.json"
                  ref={importInputRef}
                  onChange={handleFileUpload}
                  disabled={importing}
                />
              </label>
            </div>
            {importing && (
              <p className="text-center text-sm text-primary">
                Processando arquivo, por favor aguarde...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="catalogo" className="w-full">
        <TabsList>
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>
        <TabsContent value="catalogo" className="mt-4">
          <CatalogoTable hideHeader={true} />
        </TabsContent>
        <TabsContent value="pedidos" className="mt-4">
          <PedidosCatalogoAdmin />
        </TabsContent>
      </Tabs>
    </div>
  )
}
