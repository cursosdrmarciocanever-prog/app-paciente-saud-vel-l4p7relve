import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getConversas,
  createConversa,
  getMensagens,
  createMensagem,
  Conversa,
  Mensagem,
} from '@/services/suporte'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRealtime } from '@/hooks/use-realtime'
import { Send, PlusCircle, MessageSquare, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Suporte() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [activeConversa, setActiveConversa] = useState<Conversa | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadConversas = async () => {
    if (!user) return
    try {
      setLoading(true)
      setLoadError(null)
      const data = await getConversas(user.id)
      setConversas(data)
      if (data.length > 0 && !activeConversa) {
        setActiveConversa(data[0])
      }
    } catch (error) {
      console.error(error)
      setLoadError('Erro, não foi possível carregar as conversas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversas()
  }, [user])

  useRealtime('conversas_suporte', () => {
    loadConversas()
  })

  useEffect(() => {
    if (!activeConversa) return
    const loadMensagens = async () => {
      try {
        const msgs = await getMensagens(activeConversa.id, user?.id)
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

  const handleNewConversa = async () => {
    if (!user) return
    try {
      const nova = await createConversa({
        usuario_id: user.id,
        titulo: `Atendimento ${new Date().toLocaleDateString()}`,
        status: 'ativa',
      })
      setConversas([nova, ...conversas])
      setActiveConversa(nova)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o chat',
        variant: 'destructive',
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversa || !user) return

    try {
      await createMensagem({
        conversa_id: activeConversa.id,
        usuario_id: user.id,
        remetente: 'paciente',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center flex-col gap-4 bg-background p-8 text-center border border-border rounded-lg shadow-sm">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <p className="text-base font-medium text-foreground">{loadError}</p>
        <Button onClick={loadConversas} variant="default" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background border border-border rounded-lg overflow-hidden shadow-sm relative">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground text-center text-xs py-1.5 font-medium w-full z-20">
          Você está offline. Verifique sua conexão.
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Meus Chamados
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewConversa}
              className="hover:text-primary"
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {conversas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-4">
                  Nenhum chamado aberto.
                </p>
              ) : (
                conversas.map((c) => (
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
                    <div className="font-medium truncate">{c.titulo || 'Chat sem título'}</div>
                    <div className="text-xs mt-1 opacity-80 flex justify-between items-center">
                      <span>{new Date(c.created).toLocaleDateString()}</span>
                      <span className="capitalize">{c.status}</span>
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
                <h3 className="font-medium">{activeConversa.titulo}</h3>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    activeConversa.status === 'ativa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {activeConversa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                </span>
              </div>

              <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-4 max-w-3xl mx-auto pb-4">
                  {mensagens.map((m) => {
                    const isPaciente = m.remetente === 'paciente'
                    return (
                      <div
                        key={m.id}
                        className={cn('flex', isPaciente ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                            isPaciente
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-card text-card-foreground border border-border rounded-tl-sm',
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {m.conteudo}
                          </p>
                          <span className="text-[10px] opacity-70 mt-1.5 block">
                            {new Date(m.created).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                      !isOnline
                        ? 'Você está offline...'
                        : activeConversa.status === 'ativa'
                          ? 'Digite sua mensagem...'
                          : 'Chamado encerrado'
                    }
                    disabled={activeConversa.status !== 'ativa' || !isOnline}
                    className="flex-1 rounded-full px-4"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || activeConversa.status !== 'ativa' || !isOnline}
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
              <p>Selecione ou crie um chamado para iniciar o chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
