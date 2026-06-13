import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const plan = searchParams.get('plan')

  return (
    <div className="w-full max-w-2xl mx-auto p-4 py-12 animate-fade-in-up">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Finalize a contratação do seu plano.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Plano Selecionado: {plan === 'entry' ? 'Plano Entry' : plan}
          </h2>
          <p className="text-muted-foreground mb-8">
            Você está a um passo de garantir acesso ilimitado à saúde.
          </p>
          <Button
            className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => alert('Checkout simulado com sucesso!')}
          >
            Finalizar Pagamento
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
