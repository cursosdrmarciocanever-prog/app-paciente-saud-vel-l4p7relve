import { useState, useEffect } from 'react'
import { getBioimpedances, getFileUrl, BioimpedanceRecord } from '@/services/bioimpedance'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { FileText, Download, Activity, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { LogBioimpedanceDialog } from '@/components/dashboard/LogBioimpedanceDialog'

export default function Bioimpedance() {
  const [records, setRecords] = useState<BioimpedanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getBioimpedances()
      setRecords(data)
    } catch (err) {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('bioimpedance', () => {
    loadData()
  })

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Bioimpedância</h1>
        </div>

        <LogBioimpedanceDialog
          trigger={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Relatório
            </Button>
          }
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      ) : records.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhuma avaliação de bioimpedância encontrada.</p>
            <p className="text-sm mt-1">
              Clique no botão acima para adicionar seu primeiro relatório.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {format(new Date(record.date), 'dd/MM/yyyy')}
                </CardTitle>
                <FileText className="w-4 h-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                  {record.notes || <span className="italic opacity-50">Sem observações</span>}
                </p>
                {record.report ? (
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <a
                      href={getFileUrl(record.id, record.report)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Relatório
                    </a>
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full opacity-50" disabled>
                    Sem anexo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
