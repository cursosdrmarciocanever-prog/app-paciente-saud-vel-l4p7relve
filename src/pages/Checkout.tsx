import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CreditCard, Wallet, FileText, Lock } from 'lucide-react'

import { getSubscription, SubscriptionRecord } from '@/services/subscriptions'
import { processCheckout } from '@/services/payments'
import { validateCPF, formatCurrency } from '@/lib/utils'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

const checkoutSchema = z
  .object({
    fullName: z.string().min(3, 'Nome completo é obrigatório'),
    email: z.string().email('Email inválido'),
    cpf: z.string().refine(validateCPF, 'CPF inválido'),
    method: z.enum(['cartao_credito', 'pix', 'boleto']),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.method === 'cartao_credito') {
        return !!data.cardNumber && !!data.expiry && !!data.cvv
      }
      return true
    },
    {
      message: 'Preencha os dados do cartão',
      path: ['cardNumber'],
    },
  )

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function Checkout() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [sub, setSub] = useState<SubscriptionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cpf: '',
      method: 'cartao_credito',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  })

  const watchMethod = form.watch('method')

  useEffect(() => {
    if (!planId) {
      navigate('/planos')
      return
    }
    getSubscription(planId).then((data) => {
      if (!data) {
        toast.error('Assinatura não encontrada')
        navigate('/planos')
      } else {
        setSub(data)
      }
      setLoading(false)
    })
  }, [planId, navigate])

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!sub) return
    setProcessing(true)
    try {
      const token =
        values.cardNumber === '0000000000000000'
          ? 'fail_token'
          : 'tok_' + Math.random().toString(36).substring(7)

      await processCheckout(sub.id, values.method, token, values.cpf)
      toast.success('Pagamento aprovado!')
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err?.data?.message || err.message || 'Erro ao processar pagamento'
      toast.error(msg === 'Cartão recusado pelo gateway.' ? 'Cartão recusado' : msg)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-96" />
        </div>
        <div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!sub) return null

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finalizar Assinatura</h1>
        <p className="text-gray-500">Ambiente seguro. Seus dados estão protegidos.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Dados de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João da Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="joao@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem className="md:w-1/2">
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Método de Pagamento</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="cartao_credito" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 cursor-pointer">
                                <CreditCard className="mb-3 h-6 w-6" />
                                Cartão de Crédito
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="pix" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 cursor-pointer">
                                <Wallet className="mb-3 h-6 w-6" />
                                PIX
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="boleto" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 cursor-pointer">
                                <FileText className="mb-3 h-6 w-6" />
                                Boleto
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchMethod === 'cartao_credito' && (
                    <div className="p-4 bg-gray-50 rounded-lg border space-y-4 animate-in slide-in-from-top-2">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Cartão</FormLabel>
                            <FormControl>
                              <Input placeholder="0000 0000 0000 0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validade</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/AA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} type="password" maxLength={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={processing}
                  >
                    {processing ? 'Processando...' : 'Confirmar Pagamento'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader className="bg-gray-50 rounded-t-xl border-b">
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 uppercase">Plano {sub.plan}</span>
                <span className="font-bold text-gray-900">{formatCurrency(sub.monthly_price)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Periodicidade</span>
                <span className="font-medium">Mensal</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Primeira Renovação</span>
                <span className="font-medium">Hoje</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">Total a Pagar</span>
                <span className="font-bold text-blue-600">{formatCurrency(sub.monthly_price)}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-xl border-t py-4 text-xs text-gray-500 justify-center flex gap-2 items-center">
              <Lock className="w-4 h-4" /> Transação 100% segura e criptografada
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
