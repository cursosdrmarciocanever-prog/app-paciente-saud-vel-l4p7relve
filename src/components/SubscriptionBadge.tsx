import { Badge } from '@/components/ui/badge'

export function SubscriptionBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''

  if (s === 'ativa' || s === 'ativo' || s === 'active') {
    return <Badge className="bg-[#10B981] hover:bg-[#10B981]/90 text-white border-0">Ativa</Badge>
  }
  if (s === 'pendente') {
    return (
      <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white border-0">Pendente</Badge>
    )
  }
  if (s === 'cancelada') {
    return (
      <Badge className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white border-0">Cancelada</Badge>
    )
  }
  if (s === 'atrasada' || s === 'expirada') {
    return (
      <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white border-0">Atrasada</Badge>
    )
  }

  return (
    <Badge variant="outline" className="capitalize">
      {status || 'Desconhecido'}
    </Badge>
  )
}
