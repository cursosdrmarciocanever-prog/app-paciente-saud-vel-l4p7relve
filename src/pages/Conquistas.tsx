import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Badge as BadgeType,
  TipoCriterio,
  TIPO_CRITERIO_LABEL,
  getBadges,
  getUserBadges,
} from '@/services/gamificacao'
import { getAtividades } from '@/services/atividades'
import { getRefeicoes } from '@/services/refeicoes'
import { getHistoricoHidratacao } from '@/services/hidratacao'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy } from 'lucide-react'

export default function Conquistas() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [conquistadosIds, setConquistadosIds] = useState<Set<string>>(new Set())
  const [counts, setCounts] = useState<Record<TipoCriterio, number>>({
    atividades: 0,
    refeicoes: 0,
    hidratacao_dias: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!user) return
    try {
      const [todos, doUsuario, ativ, refs, hidr] = await Promise.all([
        getBadges(),
        getUserBadges(user.id),
        getAtividades(user.id),
        getRefeicoes(user.id),
        getHistoricoHidratacao(user.id),
      ])
      setBadges(todos)
      setConquistadosIds(new Set(doUsuario.map((u) => u.badge_id)))
      setCounts({
        atividades: ativ.length,
        refeicoes: refs.length,
        hidratacao_dias: hidr.length,
      })
    } catch (_) {
      toast({ title: 'Erro', description: 'Não foi possível carregar as conquistas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useRealtime('user_badges', () => fetch())

  const totalConquistados = conquistadosIds.size

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-7 w-7 text-primary" /> Minhas Conquistas
        </h1>
        <p className="text-muted-foreground">
          {loading
            ? 'Carregando...'
            : `Você desbloqueou ${totalConquistados} de ${badges.length} conquistas.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => {
          const conquistado = conquistadosIds.has(b.id)
          const atual = Math.min(counts[b.tipo_criterio] ?? 0, b.meta)
          const pct = Math.round((atual / b.meta) * 100)
          return (
            <Card
              key={b.id}
              className={conquistado ? 'border-primary/50 bg-primary/5' : 'opacity-90'}
            >
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div
                  className={`text-4xl ${conquistado ? '' : 'grayscale opacity-50'}`}
                  aria-hidden
                >
                  {b.icone || '🏅'}
                </div>
                <h3 className="font-semibold">{b.nome}</h3>
                <p className="text-sm text-muted-foreground">{b.descricao}</p>
                {conquistado ? (
                  <span className="mt-1 text-xs font-medium text-primary">✓ Conquistado</span>
                ) : (
                  <div className="w-full mt-1 space-y-1">
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {atual}/{b.meta} {TIPO_CRITERIO_LABEL[b.tipo_criterio]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
