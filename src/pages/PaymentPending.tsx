import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getActiveSubscription,
  createPendingSubscription,
  cancelSubscription,
  SubscriptionRecord,
} from '@/services/subscriptions'
import { getUserPayments, PaymentRecord } from '@/services/payments'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

const PLANS = [
  { id: 'entry', name: 'Plano Entry', price: 99.9, features: ['Acesso básico', 'Suporte email'] },
  {
    id: 'intermediate',
    name: 'Plano Intermediate',
    price: 149.9,
    features: ['Acesso total', 'Suporte prioritário', 'Consultas online'],
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 299.9,
    features: ['Tudo do Intermediate', 'Nutricionista', 'Personal Trainer'],
  },
  {
    id: 'diamond',
    name: 'Plano Diamond',
    price: 499.9,
    features: ['Tudo do Premium', 'Acompanhamento 24/7', 'Exames em casa'],
  },
]

export default function PaymentPending() {
  const [activeSub, setActiveSub] = useState<SubscriptionRecord | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const sub = await getActiveSubscription(user.id)
      setActiveSub(sub)
      if (sub) {
        const history = await getUserPayments(user.id)
        setPayments(history)
      }
    } catch (e) {
      toast.error('Erro ao carregar dados da assinatura')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async (planId: string, price: number) => {
    if (!user) return
    try {
      setLoading(true)
      const newSub = await createPendingSubscription(user.id, planId, price)
      navigate(`/checkout/${newSub.id}`)
    } catch (e) {
      toast.error('Erro ao selecionar plano')
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!activeSub) return
    try {
      await cancelSubscription(activeSub.id)
      toast.success('Assinatura cancelada com sucesso')
      loadData()
    } catch (e) {
      toast.error('Erro ao cancelar assinatura')
    }
  }

  if (loading)
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )

  if (activeSub) {
    const planInfo = PLANS.find((p) => p.id === activeSub.plan)
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sua Assinatura</h1>
          <p className="text-gray-600 mt-2">Gerencie seu plano atual e histórico de pagamentos.</p>
        </div>

        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{planInfo?.name || 'Plano Ativo'}</CardTitle>
                <CardDescription className="text-base mt-1">
                  Status: <Badge className="bg-green-500">Ativa</Badge>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Valor Mensal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(activeSub.monthly_price)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Início</p>
                  <p className="text-gray-900">
                    {formatDate(activeSub.start_date || activeSub.created)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Próxima Renovação</p>
                  <p className="text-gray-900">{formatDate(activeSub.renewal_date)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Cancelar Assinatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja cancelar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você perderá o acesso aos benefícios do {planInfo?.name} no final do ciclo
                    atual. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                    Sim, cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Histórico de Pagamentos</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      Nenhum pagamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.payment_date || p.created)}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="capitalize">{p.method.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === 'aprovado'
                              ? 'default'
                              : p.status === 'recusado'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className={p.status === 'aprovado' ? 'bg-green-500' : ''}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Escolha seu plano</h1>
        <p className="text-lg text-gray-600 mt-4">
          Selecione o plano que melhor atende às suas necessidades e comece sua jornada hoje.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className="flex flex-col hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-blue-900">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">
                  {formatCurrency(plan.price).replace(',00', '')}
                </span>
                <span className="text-gray-500">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan.id, plan.price)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
