import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  META_PADRAO_ML,
  getHidratacaoDoDia,
  setHidratacaoDoDia,
} from '@/services/hidratacao'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Droplets, Minus, Plus } from 'lucide-react'

const COPO_ML = 250

export function WaterTrackerCard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [ml, setMl] = useState(0)
  const [meta, setMeta] = useState(META_PADRAO_ML)
  const [saving, setSaving] = useState(false)
  const dia = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!user) return
    getHidratacaoDoDia(user.id, dia)
      .then((reg) => {
        if (reg) {
          setMl(reg.quantidade_ml || 0)
          if (reg.meta_ml) setMeta(reg.meta_ml)
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const ajustar = async (delta: number) => {
    if (!user) return
    const novo = Math.max(0, ml + delta)
    setMl(novo) // otimista
    setSaving(true)
    try {
      await setHidratacaoDoDia(user.id, dia, novo, meta)
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a hidratação.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const pct = Math.min(100, Math.round((ml / meta) * 100))
  const copos = Math.round(ml / COPO_ML)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplets className="h-5 w-5 text-blue-500" /> Hidratação de hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold">{(ml / 1000).toFixed(2)}</span>
            <span className="text-muted-foreground"> / {(meta / 1000).toFixed(1)} L</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {copos} {copos === 1 ? 'copo' : 'copos'}
          </span>
        </div>
        <Progress value={pct} className="h-2.5" />
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => ajustar(-COPO_ML)}
            disabled={saving || ml === 0}
            className="flex-1"
          >
            <Minus className="mr-1 h-4 w-4" /> {COPO_ML}ml
          </Button>
          <Button
            size="sm"
            onClick={() => ajustar(COPO_ML)}
            disabled={saving}
            className="flex-1"
          >
            <Plus className="mr-1 h-4 w-4" /> {COPO_ML}ml
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
