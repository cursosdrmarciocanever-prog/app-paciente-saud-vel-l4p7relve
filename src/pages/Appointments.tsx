import { AppointmentList } from '@/components/appointments/AppointmentList'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CreditCard } from 'lucide-react'

export default function Appointments() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Sucesso',
      description: 'Seu perfil foi atualizado com sucesso.',
      duration: 3000,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Minhas Consultas</h2>
          <p className="text-muted-foreground mb-6">
            Gerencie seus encontros com a equipe multidisciplinar.
          </p>
          <AppointmentList />
        </div>

        <Card className="border-border/50 shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              Assinatura e Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="font-semibold text-foreground">Plano Saudável Premium</p>
                <p className="text-sm text-muted-foreground">Próxima cobrança em 15/05/2026</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">R$ 149,90</p>
                <p className="text-xs text-primary font-medium">Ativo</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Gerenciar Assinatura
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card className="border-border/50 shadow-sm sticky top-24">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e biometria inicial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input defaultValue="Mariana Silva" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="mariana@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input type="tel" defaultValue="(11) 98765-4321" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
              <div className="space-y-2">
                <Label>Meta de Peso (kg)</Label>
                <Input type="number" defaultValue="65" />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input type="number" defaultValue="165" />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-4">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
