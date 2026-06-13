import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, Calendar as CalendarIcon, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { PedidoInjetavel } from '@/services/injectables'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Separator } from '@/components/ui/separator'

export default function SucessoInjetavel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState<PedidoInjetavel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/dashboard')
      return
    }

    const fetchPedido = async () => {
      try {
        const record = await pb.collection('pedidos_injetaveis').getOne<PedidoInjetavel>(id, {
          expand: 'injetavel_id',
        })
        setPedido(record)
      } catch (error) {
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchPedido()
  }, [id, navigate])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!pedido) return null

  const injetavel = pedido.expand?.injetavel_id

  return (
    <div className="container max-w-2xl mx-auto p-4 py-12 animate-fade-in-up">
      <Card className="border-green-600/20 shadow-elevation overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600" />

        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto w-20 h-20 bg-green-50 flex items-center justify-center rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
            Seu pedido foi criado com sucesso e o pagamento aprovado. Enviamos os detalhes para o
            seu e-mail.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 sm:px-12 pb-10 space-y-8">
          <div className="bg-secondary/30 rounded-xl p-6 border border-border/50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-600" /> Detalhes do Pedido
            </h3>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Produto</p>
                  <p className="font-medium text-foreground">{injetavel?.nome}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Quantidade / Tipo</p>
                  <p className="font-medium text-foreground">
                    {pedido.quantidade}x {pedido.tipo_compra === 'kit' ? 'Kit' : 'Ampola'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Valor Total</p>
                  <p className="font-medium text-foreground">{formatPrice(pedido.preco_total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Pago
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Entrega / Aplicação</h3>

            {pedido.opcao_entrega === 'agendar_clinica' ? (
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-yellow-100 p-2 rounded-full text-yellow-700">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Aplicação na Clínica agendada</p>
                  {pedido.data_agendamento && (
                    <p className="text-muted-foreground mt-1">
                      Você tem um horário reservado para o dia{' '}
                      <span className="font-medium text-foreground">
                        {format(parseISO(pedido.data_agendamento), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      .
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Por favor, chegue com 10 minutos de antecedência.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Envio para Endereço</p>
                  <p className="text-muted-foreground mt-1">
                    Seu produto será preparado e enviado para:
                  </p>
                  <p className="font-medium text-foreground mt-1 bg-muted/50 p-2 rounded text-sm">
                    {pedido.endereco_entrega}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    O prazo de entrega estimado é de 2 a 5 dias úteis.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            {pedido.opcao_entrega === 'agendar_clinica' && (
              <Button
                onClick={() => navigate('/meus-agendamentos')}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                Ver meus Agendamentos
              </Button>
            )}
            <Button
              onClick={() => navigate('/dashboard')}
              variant={pedido.opcao_entrega === 'agendar_clinica' ? 'outline' : 'default'}
              className={
                pedido.opcao_entrega !== 'agendar_clinica'
                  ? 'bg-yellow-600 hover:bg-yellow-700 flex-1'
                  : 'flex-1'
              }
            >
              Voltar ao Início <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
