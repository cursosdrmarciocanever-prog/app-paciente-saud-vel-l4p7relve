import { useState, useEffect } from 'react'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { AppointmentBookingFlow } from '@/components/appointments/AppointmentBookingFlow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Info } from 'lucide-react'
import { getActiveSubscription, SubscriptionRecord } from '@/services/subscriptions'
import { AppointmentRecord } from '@/services/appointments'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format, startOfDay, addDays } from 'date-fns'
import pb from '@/lib/pocketbase/client'

const planIntervals: Record<string, number> = {
  entry: 90,
  intermediate: 60,
  premium: 30,
  diamond: 7,
}
const planNames: Record<string, string> = {
  entry: 'Entry',
  intermediate: 'Intermediate',
  premium: 'Premium',
  diamond: 'Diamond',
}

export default function Appointments() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [mostRecentApt, setMostRecentApt] = useState<AppointmentRecord | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    if (!user) return
    const fetchStatus = async () => {
      try {
        const sub = await getActiveSubscription(user.id)
        setSubscription(sub)
        try {
          const apts = await pb.collection('appointments').getList<AppointmentRecord>(1, 1, {
            filter: `user = "${user.id}" && status != "cancelado"`,
            sort: '-date',
            requestKey: null,
          })
          setMostRecentApt(apts.items[0] || null)
        } catch {
          setMostRecentApt(null)
        }
      } catch {
        setSubscription(null)
      } finally {
        setLoadingStatus(false)
      }
    }
    fetchStatus()
    window.addEventListener('appointments-updated', fetchStatus)
    return () => window.removeEventListener('appointments-updated', fetchStatus)
  }, [user])

  let isEligible = false
  let nextAvailableDate: Date | null = null

  if (subscription?.status === 'active') {
    if (!mostRecentApt) isEligible = true
    else {
      const interval = planIntervals[subscription.plan] || 90
      nextAvailableDate = addDays(startOfDay(new Date(mostRecentApt.date)), interval)
      if (startOfDay(new Date()) >= nextAvailableDate) isEligible = true
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="flex flex-col mb-6">
          <h2 className="text-2xl font-bold tracking-tight mb-1">Minhas Consultas</h2>
          <p className="text-muted-foreground">
            Gerencie seus encontros com a equipe multidisciplinar.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-2">
            <TabsTrigger value="list">Suas Consultas</TabsTrigger>
            <TabsTrigger value="schedule">Agendar Nova</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <AppointmentList onScheduleClick={() => setActiveTab('schedule')} />
          </TabsContent>

          <TabsContent value="schedule">
            {!loadingStatus && (!subscription || subscription.status !== 'active') ? (
              <Alert className="bg-destructive/10 text-destructive border-destructive/20">
                <Info className="h-4 w-4" />
                <AlertTitle>Assinatura Inativa</AlertTitle>
                <AlertDescription>
                  Você precisa de uma assinatura ativa para agendar consultas.
                </AlertDescription>
              </Alert>
            ) : !isEligible && nextAvailableDate ? (
              <Alert className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Agendamento Indisponível</AlertTitle>
                <AlertDescription>
                  Pelo seu plano <strong>{planNames[subscription?.plan || '']}</strong>, você pode
                  agendar consultas a cada {planIntervals[subscription?.plan || '']} dias. Sua
                  próxima data disponível é{' '}
                  <strong>{format(nextAvailableDate, 'dd/MM/yyyy')}</strong>.
                </AlertDescription>
              </Alert>
            ) : user && subscription ? (
              <AppointmentBookingFlow
                userId={user.id}
                subscriptionId={subscription.id}
                onSuccess={() => {
                  window.dispatchEvent(new Event('appointments-updated'))
                  setActiveTab('list')
                }}
              />
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-64 w-full" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <Card className="border-border/50 shadow-sm sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              Status do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingStatus ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : subscription ? (
              <>
                <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground">
                      Plano {planNames[subscription.plan] || 'Premium'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Renovação:{' '}
                      {subscription.renewal_date
                        ? format(new Date(subscription.renewal_date), 'dd/MM/yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {subscription.monthly_price
                        ? `R$ ${subscription.monthly_price.toFixed(2).replace('.', ',')}`
                        : '-'}
                    </p>
                    <p
                      className={`text-xs font-medium ${subscription.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}
                    >
                      {subscription.status === 'active' ? 'Ativo' : 'Pendente'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Benefício do plano: consultas a cada {planIntervals[subscription.plan]} dias.
                    {mostRecentApt &&
                      ` Última: ${format(new Date(mostRecentApt.date), 'dd/MM/yyyy')}.`}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-4 border border-dashed rounded-lg">
                <p className="text-muted-foreground text-sm mb-3">
                  Você não possui uma assinatura ativa.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
