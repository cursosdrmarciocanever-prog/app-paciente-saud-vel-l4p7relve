import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getConversas,
  getMensagens,
  createMensagem,
  updateConversaStatus,
  Conversa,
  Mensagem,
} from '@/services/suporte'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRealtime } from '@/hooks/use-realtime'
import { Send, MessageSquare, CheckCircle, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AdminSuporte() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [filteredConversas, setFilteredConversas] = useState<Conversa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeConversa, setActiveConversa] = useState<Conversa | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversas = async () => {
    try {
      const data = await getConversas()
      setConversas(data)
      setFilteredConversas(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversas()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredConversas(
        conversas.filter(
          (c) =>
            c.expand?.usuario_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    } else {
      setFilteredConversas(conversas)
    }
  }, [searchTerm, conversas])

  useRealtime('conversas_suporte', () => {
    loadConversas()
  })

  useEffect(() => {
    if (!activeConversa) return
    const loadMensagens = async () => {
      try {
        const msgs = await getMensagens(activeConversa.id)
        setMensagens(msgs)
        scrollToBottom()
      } catch (error) {
        console.error(error)
      }
    }
    loadMensagens()
  }, [activeConversa])

  useRealtime('mensagens_suporte', (e) => {
    if (activeConversa && e.record.conversa_id === activeConversa.id) {
      if (e.action === 'create') {
        setMensagens((prev) => [...prev, e.record as unknown as Mensagem])
        scrollToBottom()
      }
    }
  })

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversa || !user) return

    try {
      await createMensagem({
        conversa_id: activeConversa.id,
        usuario_id: activeConversa.usuario_id,
        remetente: 'agente_ia',
        conteudo: newMessage.trim(),
      })
      setNewMessage('')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      })
    }
  }

  const handleCloseConversa = async () => {
    if (!activeConversa) return
    try {
      await updateConversaStatus(activeConversa.id, 'encerrada')
      setActiveConversa({ ...activeConversa, status: 'encerrada' })
      toast({ title: 'Sucesso', description: 'Chamado encerrado.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível encerrar', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="w-1/3 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border space-y-4 bg-muted/30">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Central de Suporte
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredConversas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-4">
                Nenhum chamado encontrado.
              </p>
            ) : (
              filteredConversas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConversa(c)}
                  className={cn(
                    'w-full text-left p-3 rounded-md transition-colors',
                    activeConversa?.id === c.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-secondary/50',
                  )}
                >
                  <div className="font-medium truncate">
                    {c.expand?.usuario_id?.name || 'Paciente'}
                  </div>
                  <div className="text-sm truncate opacity-90">{c.titulo || 'Sem título'}</div>
                  <div className="text-[10px] mt-1.5 opacity-80 flex justify-between items-center">
                    <span>{new Date(c.updated).toLocaleDateString()}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-sm uppercase text-[9px] font-semibold',
                        c.status === 'ativa'
                          ? activeConversa?.id === c.id
                            ? 'bg-primary-foreground/20'
                            : 'bg-green-500/10 text-green-600'
                          : activeConversa?.id === c.id
                            ? 'bg-primary-foreground/10'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {activeConversa ? (
          <>
            <div className="p-4 border-b border-border bg-card flex justify-between items-center shadow-sm z-10">
              <div>
                <h3 className="font-medium">
                  {activeConversa.expand?.usuario_id?.name || 'Paciente'}
                </h3>
                <p className="text-xs text-muted-foreground">{activeConversa.titulo}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    activeConversa.status === 'ativa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {activeConversa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                </span>
                {activeConversa.status === 'ativa' && (
                  <Button variant="outline" size="sm" onClick={handleCloseConversa} className="h-8">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Encerrar
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-muted/10">
              <div className="space-y-4 max-w-3xl mx-auto pb-4">
                {mensagens.map((m) => {
                  const isPaciente = m.remetente === 'paciente'
                  return (
                    <div
                      key={m.id}
                      className={cn('flex', !isPaciente ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                          !isPaciente
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card text-card-foreground border border-border rounded-tl-sm',
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.conteudo}</p>
                        <span className="text-[10px] opacity-70 mt-1.5 block text-right">
                          {new Date(m.created).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {!isPaciente && ' (Suporte)'}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={handleSendMessage}
                className="flex gap-3 max-w-3xl mx-auto items-center"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    activeConversa.status === 'ativa'
                      ? 'Responder como suporte...'
                      : 'Chamado encerrado'
                  }
                  disabled={activeConversa.status !== 'ativa'}
                  className="flex-1 rounded-full px-4"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || activeConversa.status !== 'ativa'}
                  className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4 bg-muted/10">
            <MessageSquare className="w-16 h-16 opacity-20" />
            <p>Selecione um chamado para visualizar ou responder.</p>
          </div>
        )}
      </div>
    </div>
  )
}
