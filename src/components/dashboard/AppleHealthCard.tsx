import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  healthDisponivel,
  getResumoHoje,
  getHistoricoPassos,
  sincronizarAppleWatch,
  type ResumoDiario,
  type DiaPassos,
} from '@/services/appleHealth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footprints, Flame, RefreshCw, Activity } from 'lucide-react'

export function AppleHealthCard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [disponivel, setDisponivel] = useState(false)
  const [resumo, setResumo] = useState<ResumoDiario | null>(null)
  const [historico, setHistorico] = useState<DiaPassos[]>([])
  const [carregando, setCarregando] = useState(true)
  const [sincronizando, setSincronizando] = useState(false)

  // Carrega o resumo de hoje e sincroniza treinos em segundo plano ao abrir.
  useEffect(() => {
    if (!user) return
    let ativo = true
    ;(async () => {
      const ok = await healthDisponivel()
      if (!ativo) return
      setDisponivel(ok)
      if (!ok) {
        setCarregando(false)
        return
      }
      try {
        const [r, h] = await Promise.all([getResumoHoje(), getHistoricoPassos(7)])
        if (ativo && r) setResumo(r)
        if (ativo && h.length) setHistorico(h)
      } catch (_) {
        /* silencioso */
      } finally {
        if (ativo) setCarregando(false)
      }
      // sincroniza treinos sem travar a UI nem alertar
      sincronizarAppleWatch(user.id, 30).catch(() => {})
    })()
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const sincronizarManual = async () => {
    if (!user) return
    setSincronizando(true)
    try {
      const [r, h, sync] = await Promise.all([
        getResumoHoje(),
        getHistoricoPassos(7),
        sincronizarAppleWatch(user.id, 90),
      ])
      if (r) setResumo(r)
      if (h.length) setHistorico(h)
      toast({
        title: 'Apple Watch sincronizado',
        description:
          sync.importados > 0
            ? `${sync.importados} novo(s) treino(s) importado(s).`
            : 'Tudo em dia. Nenhum treino novo.',
      })
    } catch (_) {
      toast({
        title: 'Erro ao sincronizar',
        description: 'Verifique as permissões do app Saúde.',
        variant: 'destructive',
      })
    } finally {
      setSincronizando(false)
    }
  }

  // Só faz sentido no app nativo com HealthKit disponível.
  if (!disponivel && !carregando) return null

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Atividade de Hoje</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={sincronizarManual}
            disabled={sincronizando}
            aria-label="Sincronizar Apple Watch"
          >
            <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl bg-secondary/40 p-4">
            <Footprints className="w-6 h-6 text-primary mb-2" />
            <span className="text-2xl font-bold text-foreground">
              {carregando ? '—' : (resumo?.passos ?? 0).toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-muted-foreground">passos</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-secondary/40 p-4">
            <Flame className="w-6 h-6 text-primary mb-2" />
            <span className="text-2xl font-bold text-foreground">
              {carregando ? '—' : (resumo?.calorias ?? 0).toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-muted-foreground">kcal ativas</span>
          </div>
        </div>

        {historico.some((d) => d.passos > 0) && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1.5">Passos · últimos 7 dias</p>
            <div className="flex items-end justify-between gap-1 h-20">
              {(() => {
                const max = Math.max(...historico.map((d) => d.passos), 1)
                const fmtDia = (s: string) => {
                  const [y, m, d] = s.split('-').map(Number)
                  return new Date(y, m - 1, d)
                    .toLocaleDateString('pt-BR', { weekday: 'short' })
                    .replace('.', '')
                    .slice(0, 3)
                }
                return historico.map((d, i) => (
                  <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t bg-primary/70"
                        style={{ height: `${Math.max(4, (d.passos / max) * 100)}%` }}
                        title={`${d.passos.toLocaleString('pt-BR')} passos`}
                      />
                    </div>
                    <span
                      className={`text-[10px] ${
                        i === historico.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {fmtDia(d.dia)}
                    </span>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Apple Saúde · Apple Watch, Amazfit e outros · automático
        </p>
      </CardContent>
    </Card>
  )
}
