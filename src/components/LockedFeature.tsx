import { Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function LockedFeature({ title }: { title: string }) {
  return (
    <Card className="border-dashed bg-muted/30 max-w-2xl mx-auto mt-12">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">{title} Exclusivo</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Esta funcionalidade está disponível apenas para assinantes do Plano Premium. Faça o
          upgrade agora para desbloquear o acesso completo.
        </p>
        <Button asChild>
          <Link to="/planos">Ver Planos Premium</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
