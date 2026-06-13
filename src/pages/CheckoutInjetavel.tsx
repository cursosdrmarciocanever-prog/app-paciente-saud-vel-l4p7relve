import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Syringe,
  Minus,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Injetavel, getInjetavelImageUrl } from '@/services/injectables'
import { Slot, getAvailableSlots } from '@/services/slots'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

const TAXA_ENVIO = 30.0

const formSchema = z
  .object({
    quantidade: z.number().min(1).max(10),
    opcaoEntrega: z.enum(['agendar_clinica', 'enviar_endereco'], {
      required_error: 'Selecione uma forma de recebimento.',
    }),
    slotId: z.string().optional(),
    endereco: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.opcaoEntrega === 'agendar_clinica' && !data.slotId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione um horário disponível para a aplicação.',
        path: ['slotId'],
      })
    }
  })

export default function CheckoutInjetavel() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tipo = searchParams.get('tipo') as 'ampola' | 'kit'
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const [injetavel, setInjetavel] = useState<Injetavel | null>(null)
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantidade: 1,
      opcaoEntrega: undefined,
      slotId: '',
      endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP', // Mock user address
    },
  })

  useEffect(() => {
    if (!id || (tipo !== 'ampola' && tipo !== 'kit')) {
      navigate('/injetaveis')
      return
    }

    const fetchData = async () => {
      try {
        const [record, availableSlots] = await Promise.all([
          pb.collection('injetaveis').getOne<Injetavel>(id),
          getAvailableSlots(new Date()),
        ])
        setInjetavel(record)

        if (availableSlots.length === 0) {
          // Mock slots to ensure end-to-end flow visibility
          const mockSlots: Slot[] = []
          const today = new Date()
          for (let i = 0; i <= 3; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]
            mockSlots.push({
              id: `mock-${i}a`,
              data: `${dateStr} 10:00:00.000Z`,
              hora_inicio: '10:00',
              hora_fim: '10:30',
              agendado: false,
              medico_id: 'mock',
              tipo: 'presencial',
              created: '',
              updated: '',
            })
            mockSlots.push({
              id: `mock-${i}b`,
              data: `${dateStr} 14:00:00.000Z`,
              hora_inicio: '14:00',
              hora_fim: '14:30',
              agendado: false,
              medico_id: 'mock',
              tipo: 'presencial',
              created: '',
              updated: '',
            })
          }
          setSlots(mockSlots)
        } else {
          setSlots(availableSlots)
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as informações do produto.',
          variant: 'destructive',
        })
        navigate('/injetaveis')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, tipo, navigate, toast])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const encodedAddress = encodeURIComponent(values.endereco || '')
    navigate(
      `/injetaveis/pagamento/${id}?tipo=${tipo}&opcao=${values.opcaoEntrega}&qtd=${values.quantidade}&slot=${values.slotId || ''}&endereco=${encodedAddress}`,
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!injetavel) return null

  const isKit = tipo === 'kit'
  const precoUnitario = isKit ? injetavel.preco_kit : injetavel.preco_ampola
  const quantidade = form.watch('quantidade') || 1
  const opcaoEntrega = form.watch('opcaoEntrega')

  const subtotal = precoUnitario * quantidade
  const taxa = opcaoEntrega === 'enviar_endereco' ? TAXA_ENVIO : 0
  const total = subtotal + taxa

  const slotsForDate = selectedDate
    ? slots.filter((s) => s.data.startsWith(selectedDate.toISOString().split('T')[0]))
    : []

  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8 animate-fade-in-up">
      <Button
        variant="ghost"
        className="mb-6 text-[#4A4A4A] hover:text-primary"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Loja
      </Button>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Summary Header */}
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative shadow-sm">
                {injetavel.imagem ? (
                  <img
                    src={getInjetavelImageUrl(injetavel)}
                    alt={injetavel.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    {isKit ? (
                      <Package className="w-8 h-8 text-primary" />
                    ) : (
                      <Syringe className="w-8 h-8 text-primary" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-bold">{injetavel.nome}</h2>
                <p className="text-muted-foreground">
                  {isKit
                    ? `Kit de Tratamento (${injetavel.quantidade_kit} unidades)`
                    : '1 Ampola Avulsa'}
                </p>
                <p className="text-xl font-semibold text-primary pt-2">
                  {formatPrice(precoUnitario)}
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Quantidade</span>
                  <div className="flex items-center border border-border/60 rounded-md bg-background h-10 overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-full px-3 rounded-none hover:bg-muted"
                      onClick={() => {
                        const v = form.getValues('quantidade')
                        if (v > 1) form.setValue('quantidade', v - 1)
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">{quantidade}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-full px-3 rounded-none hover:bg-muted"
                      onClick={() => {
                        const v = form.getValues('quantidade')
                        if (v < 10) form.setValue('quantidade', v + 1)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card className="border-border/50 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="checkout-form">
                <CardContent className="p-6 space-y-8">
                  <FormField
                    control={form.control}
                    name="opcaoEntrega"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          Forma de Recebimento
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid sm:grid-cols-2 gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 border border-border/60 p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="agendar_clinica" />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer w-full flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                Agendar na clínica
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 border border-border/60 p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="enviar_endereco" />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer w-full flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                Entrega em casa
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {opcaoEntrega === 'agendar_clinica' && (
                    <div className="animate-fade-in space-y-4 pt-4 border-t border-border/50">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Selecione a data
                          </h4>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => {
                              if (d) {
                                setSelectedDate(d)
                                form.setValue('slotId', '')
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="border border-border/60 rounded-xl bg-card shadow-sm p-3"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Horários disponíveis
                          </h4>
                          {slotsForDate.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {slotsForDate.map((slot) => (
                                <Button
                                  key={slot.id}
                                  type="button"
                                  variant={form.watch('slotId') === slot.id ? 'default' : 'outline'}
                                  onClick={() => form.setValue('slotId', slot.id)}
                                  className={cn(
                                    'h-12 border-border/60',
                                    form.watch('slotId') === slot.id &&
                                      'bg-primary hover:bg-primary/90 text-primary-foreground border-primary',
                                  )}
                                >
                                  {slot.hora_inicio}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/60 rounded-xl text-center bg-muted/30">
                              <CalendarIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                              <p className="text-sm font-medium text-muted-foreground">
                                Nenhum horário disponível para esta data.
                              </p>
                            </div>
                          )}
                          {form.formState.errors.slotId && (
                            <p className="text-[0.8rem] font-medium text-destructive mt-3 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive" />
                              {form.formState.errors.slotId.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {opcaoEntrega === 'enviar_endereco' && (
                    <div className="animate-fade-in pt-4 border-t border-border/50">
                      <div className="bg-muted/30 p-5 rounded-xl border border-border/60 flex justify-between items-center gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Endereço de Entrega</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {form.watch('endereco')}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            toast({
                              title: 'Aviso',
                              description:
                                'Edição de endereço na conta será implementada em breve.',
                            })
                          }
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </form>
            </Form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {/* Summary Card */}
          <Card className="sticky top-6 border-primary/20 shadow-elevation bg-[#FFFFFF]">
            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({quantidade} {quantidade === 1 ? 'item' : 'itens'})
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {opcaoEntrega === 'enviar_endereco' && (
                <div className="flex justify-between text-sm animate-fade-in">
                  <span className="text-muted-foreground">Taxa de envio</span>
                  <span className="font-medium">{formatPrice(taxa)}</span>
                </div>
              )}
              <Separator className="bg-border/60" />
              <div className="flex justify-between font-bold text-xl pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                form="checkout-form"
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[15px] shadow-sm transition-all hover:translate-y-[-1px]"
              >
                Prosseguir para Pagamento <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
