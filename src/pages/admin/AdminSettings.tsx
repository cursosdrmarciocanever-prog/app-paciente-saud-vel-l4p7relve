import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Settings } from 'lucide-react'

export function AdminSettings() {
  const { toast } = useToast()
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [maxPresencial, setMaxPresencial] = useState<number | ''>(5)
  const [maxTelemedicina, setMaxTelemedicina] = useState<number | ''>(10)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const loadSettings = async () => {
    try {
      const records = await pb.collection('settings').getFullList()
      if (records.length > 0) {
        const s = records[0]
        setSettingsId(s.id)
        setMaxPresencial(s.max_daily_presencial)
        setMaxTelemedicina(s.max_daily_telemedicina)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useRealtime('settings', (e) => {
    if (e.action === 'update' || e.action === 'create') {
      if (e.record.id === settingsId || !settingsId) {
        setSettingsId(e.record.id)
        setMaxPresencial(e.record.max_daily_presencial)
        setMaxTelemedicina(e.record.max_daily_telemedicina)
      }
    }
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const p = Number(maxPresencial)
    const t = Number(maxTelemedicina)

    if (p < 0 || t < 0 || !Number.isInteger(p) || !Number.isInteger(t)) {
      toast({
        title: 'Erro',
        description: 'Valores devem ser inteiros positivos.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const data = {
        max_daily_presencial: p,
        max_daily_telemedicina: t,
      }
      if (settingsId) {
        await pb.collection('settings').update(settingsId, data)
      } else {
        const rec = await pb.collection('settings').create(data)
        setSettingsId(rec.id)
      }
      toast({ title: 'Sucesso', description: 'Configurações salvas com sucesso.' })
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground animate-pulse">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Configurações Globais</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Limites de Agendamento Diário</CardTitle>
          <CardDescription>
            Defina a capacidade máxima de consultas que a clínica pode atender por dia, para cada
            modalidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="presencial">Presencial</Label>
                <Input
                  id="presencial"
                  type="number"
                  min="0"
                  step="1"
                  value={maxPresencial}
                  onChange={(e) =>
                    setMaxPresencial(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  required
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Total de pacientes presenciais por dia
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telemedicina">Telemedicina</Label>
                <Input
                  id="telemedicina"
                  type="number"
                  min="0"
                  step="1"
                  value={maxTelemedicina}
                  onChange={(e) =>
                    setMaxTelemedicina(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  required
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">Total de pacientes online por dia</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
