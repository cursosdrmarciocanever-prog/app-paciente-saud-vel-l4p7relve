import { useEffect, useState } from 'react'
import { getResumoUsoIa, type ResumoUsoIa } from '@/services/usoIa'
import { Camera, MessageSquare } from 'lucide-react'

// Mostra "X de Y usadas este mês" para o paciente premium. Fica oculto se o
// paciente não tem assinatura ativa ou se o plano não define limite para o tipo.
// Passe `refreshKey` (e mude-o) para forçar a recontagem após uma ação.
export function UsoIaIndicador({
  tipo,
  refreshKey,
}: {
  tipo: 'mensagens' | 'fotos'
  refreshKey?: number
}) {
  const [resumo, setResumo] = useState<ResumoUsoIa | null>(null)

  useEffect(() => {
    let ativo = true
    getResumoUsoIa()
      .then((r) => ativo && setResumo(r))
      .catch(() => ativo && setResumo(null))
    return () => {
      ativo = false
    }
  }, [refreshKey])

  if (!resumo) return null
  const usado = tipo === 'fotos' ? resumo.fotosUsadas : resumo.mensagensUsadas
  const limite = tipo === 'fotos' ? resumo.limiteFotos : resumo.limiteMensagens
  if (!limite) return null

  const restante = Math.max(0, limite - usado)
  const atingiu = usado >= limite
  const quase = !atingiu && restante <= Math.max(1, Math.round(limite * 0.1))
  const cor = atingiu ? 'text-destructive' : quase ? 'text-amber-600' : 'text-muted-foreground'
  const Icon = tipo === 'fotos' ? Camera : MessageSquare
  const label = tipo === 'fotos' ? 'análises de foto' : 'mensagens com especialistas'

  return (
    <p className={`flex items-center gap-1.5 text-xs ${cor}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>
        {usado} de {limite} {label} usadas este mês
        {atingiu ? ' — limite atingido' : ''}
      </span>
    </p>
  )
}
