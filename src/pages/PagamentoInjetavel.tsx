import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Calendar as CalendarIcon,
  MapPin,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Injetavel, getInjetavelImageUrl, processInjetavelPayment } from '@/services/injectables'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PagamentoInjetavel() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tipo = searchParams.get('tipo') as 'ampola' | 'kit'
  const opcao = searchParams.get('opcao') as 'agendar_clinica' | 'enviar_endereco'
  const qtd = parseInt(searchParams.get('qtd') || '1', 10)
  const slotId = searchParams.get('slot') || undefined
  const endereco = searchParams.get('endereco') || undefined

  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [injetavel, setInjetavel] = useState<Injetavel | null>(null)
  const [slotData, setSlotData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Card Form State
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  useEffect(() => {
    if (!id || (tipo !== 'ampola' && tipo !== 'kit') || !opcao) {
      navigate('/injetaveis')
      return
    }
    if (opcao === 'agendar_clinica' && !slotId) {
      navigate(-1)
      return
    }
    if (opcao === 'enviar_endereco' && !endereco) {
      navigate(-1)
      return
    }

    const fetchData = async () => {
      try {
        const record = await pb.collection('injetaveis').getOne<Injetavel>(id)
        setInjetavel(record)

        if (opcao === 'agendar_clinica' && slotId) {
          const slot = await pb.collection('slots_disponiveis').getOne(slotId)
          setSlotData(slot)
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Dados não encontrados.', variant: 'destructive' })
        navigate('/injetaveis')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, tipo, opcao, slotId, endereco, navigate, toast])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!injetavel || !user) return

    if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
      toast({
        title: 'Dados Incompletos',
        description: 'Por favor, preencha todos os campos do cartão.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const result = await processInjetavelPayment({
        injetavel_id: injetavel.id,
        tipo_compra: tipo,
        quantidade: qtd,
        opcao_entrega: opcao,
        slot_id: slotId,
        endereco: endereco,
        card_number: cardNumber,
      })

      toast({
        title: 'Pagamento aprovado!',
        description: 'Seu pedido foi processado com sucesso.',
      })
      navigate(`/injetaveis/sucesso/${result.pedido_id}`)
    } catch (error: any) {
      const errorMsg =
        error.response?.message || 'Não foi possível concluir o pagamento. Tente novamente.'
      toast({
        title: 'Falha no pagamento',
        description: errorMsg,
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!injetavel) return null

  const precoUnitario = tipo === 'kit' ? injetavel.preco_kit : injetavel.preco_ampola
  const subtotal = precoUnitario * qtd
  const taxaEnvio = opcao === 'enviar_endereco' ? 30.0 : 0
  const total = subtotal + taxaEnvio

  return (
    <div className="container max-w-5xl mx-auto p-4 py-8 animate-fade-in-up">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-[#4A4A4A] hover:text-primary"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para opções
      </Button>

      <h1 className="text-3xl font-bold mb-8">Finalizar Pagamento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulário de Pagamento */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#4A4A4A]">
                <CreditCard className="w-5 h-5 text-primary" />
                Dados do Cartão de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="payment-form" onSubmit={handleCheckout} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm cursor-not-allowed text-muted-foreground focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center justify-between">
                    Informações do Cartão
                    <span className="flex gap-1">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    </span>
                  </label>
                  <div className="rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden transition-all">
                    <input
                      type="text"
                      placeholder="Número do cartão"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="flex h-12 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none border-b border-input"
                      maxLength={19}
                    />
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="MM / AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="flex h-12 w-full flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none border-r border-input"
                        maxLength={5}
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="flex h-12 w-full flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="Nome impresso no cartão"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-5">
          <Card className="sticky top-6 border-primary/20 shadow-elevation bg-[#FFFFFF]">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={getInjetavelImageUrl(injetavel)}
                    alt={injetavel.nome}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <h4 className="font-medium text-foreground leading-tight">{injetavel.nome}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {qtd}x {tipo === 'kit' ? 'Kit' : 'Ampola'}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(subtotal)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" /> Opção de Entrega
                </h4>
                {opcao === 'agendar_clinica' ? (
                  <div className="bg-secondary/40 rounded-lg p-3 border border-secondary text-sm">
                    <p className="font-medium mb-1">Agendar aplicação na clínica</p>
                    {slotData && (
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {format(parseISO(slotData.data), "dd 'de' MMMM", { locale: ptBR })} às{' '}
                        {slotData.hora_inicio}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-secondary/40 rounded-lg p-3 border border-secondary text-sm">
                    <p className="font-medium mb-1">Enviar para meu endereço</p>
                    <p className="text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{endereco}</span>
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de envio</span>
                  <span>{taxaEnvio === 0 ? 'Grátis' : formatPrice(taxaEnvio)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-end">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t pt-4">
              <Button
                type="submit"
                form="payment-form"
                className="w-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </div>
                ) : (
                  `Pagar ${formatPrice(total)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
