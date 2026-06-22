import { useCallback, useEffect, useRef, useState, KeyboardEvent } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getConversas,
  createConversa,
  getMensagens,
  createMensagem,
  type Conversa,
  type Mensagem,
  type AgenteTipo,
} from '@/services/suporte'

const SAUDACOES: Record<AgenteTipo, string> = {
  geral: 'Olá! Sou o assistente virtual da Clínica Canever. Como posso ajudar você hoje?',
  exames:
    'Olá! Sou o assistente de exames. Posso esclarecer dúvidas gerais sobre seus exames laboratoriais. Como posso ajudar?',
  nutricional:
    'Olá! Sou o assistente nutricional da Clínica Canever. Posso orientar sobre alimentação saudável e sugerir cardápios. Como posso ajudar?',
  medico:
    'Olá! Sou o assistente médico, na linha da medicina funcional integrativa. Como posso ajudar com suas dúvidas?',
}

interface ChatProps {
  agente?: AgenteTipo
  embedded?: boolean
  // Quando fornecido, mostra um botão "Salvar como dieta" nas respostas do assistente.
  onSaveDieta?: (conteudo: string) => void | Promise<void>
}
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, AlertCircle, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import { ClientResponseError } from 'pocketbase'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function SuporteChatWrapper(props: ChatProps) {
  return (
    <ErrorBoundary>
      <SuporteChat {...props} />
    </ErrorBoundary>
  )
}

function SuporteChat({ agente = 'geral', embedded = false, onSaveDieta }: ChatProps) {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [conversa, setConversa] = useState<Conversa | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loadingSession, setLoadingSession] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (user?.id && mensagens.length > 0) {
      localStorage.setItem(`chat_mensagens_${agente}_${user.id}`, JSON.stringify(mensagens))
    }
  }, [mensagens, user?.id, agente])

  useEffect(() => {
    if (user?.id && conversa) {
      localStorage.setItem(`chat_conversa_${agente}_${user.id}`, JSON.stringify(conversa))
    }
  }, [conversa, user?.id, agente])

  const initSession = useCallback(async () => {
    if (!user?.id) {
      setLoadError('Usuário não autenticado.')
      setLoadingSession(false)
      return
    }

    const cachedConversa = localStorage.getItem(`chat_conversa_${agente}_${user.id}`)
    const cachedMensagens = localStorage.getItem(`chat_mensagens_${agente}_${user.id}`)

    if (cachedConversa && cachedMensagens) {
      try {
        setConversa(JSON.parse(cachedConversa))
        setMensagens(JSON.parse(cachedMensagens))
        setLoadingSession(false)
      } catch (e) {
        // Cache parse error, ignore
      }
    }

    try {
      if (!cachedConversa) setLoadingSession(true)
      setLoadError(null)
      pb.cancelAllRequests() // Re-initialization step to ensure clean state
      const conversas = await getConversas(user.id)
      // conversas antigas (sem agente) contam como 'geral'
      let active = conversas.find(
        (c) => c.status === 'ativa' && (c.agente || 'geral') === agente,
      )

      let isNew = false
      if (!active) {
        active = await createConversa({
          usuario_id: user.id,
          status: 'ativa',
          titulo: 'Nova Conversa',
          agente,
        })
        isNew = true
      }

      setConversa(active)

      let msgs = await getMensagens(active.id, user.id)

      if (isNew && msgs.length === 0) {
        const initialMsg = await createMensagem({
          conversa_id: active.id,
          usuario_id: user.id,
          remetente: 'agente_ia',
          conteudo: SAUDACOES[agente],
        })
        msgs = [initialMsg]
      }

      setMensagens(msgs)
    } catch (err: unknown) {
      console.error('Chat load error:', err)
      if (!cachedConversa) {
        setLoadError('Erro de conexão ou CORS. Verifique sua rede e tente novamente.')
        toast({
          title: 'Erro de Conexão',
          description: 'Não foi possível conectar ao servidor.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoadingSession(false)
    }
  }, [user, toast, agente])

  useEffect(() => {
    if (authLoading) return
    initSession()
  }, [initSession, authLoading])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensagens, isTyping])

  useRealtime<Mensagem>(
    'mensagens_suporte',
    (e) => {
      if (conversa && e.record.conversa_id === conversa.id) {
        if (e.action === 'create') {
          setMensagens((prev) => {
            if (prev.find((m) => m.id === e.record.id)) return prev
            return [...prev, e.record as Mensagem]
          })
          if (e.record.remetente === 'agente_ia') {
            setIsTyping(false)
          }
        }
      }
    },
    !!conversa,
  )

  useRealtime<Conversa>(
    'conversas_suporte',
    (e) => {
      if (conversa && e.record.id === conversa.id) {
        if (e.action === 'update') {
          setConversa(e.record as Conversa)
        }
      }
    },
    !!conversa,
  )

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || !conversa || !user?.id) return

    try {
      setIsSending(true)
      setError(null)

      const pMsg = await createMensagem({
        conversa_id: conversa.id,
        usuario_id: user.id,
        remetente: 'paciente',
        conteudo: text,
      })

      setMensagens((prev) => {
        if (prev.find((m) => m.id === pMsg.id)) return prev
        return [...prev, pMsg]
      })
      setInputText('')

      setIsTyping(true)

      // Auto-clear typing indicator after 30 seconds if no response arrives via realtime
      setTimeout(() => {
        setIsTyping((currentTypingState) => {
          if (currentTypingState) return false
          return currentTypingState
        })
      }, 30000)
    } catch (err: unknown) {
      setIsTyping(false)
      let errorMessage = 'Não foi possível enviar a mensagem'
      if (err instanceof ClientResponseError && err.status === 0) {
        errorMessage = 'Erro de conexão ou CORS. Verifique sua rede e tente novamente.'
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão ou CORS. Verifique sua rede e tente novamente.'
      } else if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão ou CORS. Verifique sua rede e tente novamente.'
      } else {
        errorMessage = getErrorMessage(err) || errorMessage
      }
      setError(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const retryAI = async () => {
    const lastMsg = mensagens[mensagens.length - 1]
    if (!lastMsg || lastMsg.remetente !== 'paciente' || !conversa || !user?.id) return

    try {
      setIsSending(true)
      setError(null)
      setIsTyping(true)

      const pMsg = await createMensagem({
        conversa_id: conversa.id,
        usuario_id: user.id,
        remetente: 'paciente',
        conteudo: lastMsg.conteudo,
      })

      setMensagens((prev) => {
        if (prev.find((m) => m.id === pMsg.id)) return prev
        return [...prev, pMsg]
      })

      setTimeout(() => {
        setIsTyping((currentTypingState) => {
          if (currentTypingState) return false
          return currentTypingState
        })
      }, 30000)
    } catch (err: unknown) {
      setIsTyping(false)
      let errorMessage = 'Não foi possível enviar a mensagem'
      if (err instanceof ClientResponseError && err.status === 0) {
        errorMessage = 'Erro de conexão ou CORS. Verifique sua rede e tente novamente.'
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão ou CORS. Verifique sua rede e tente novamente.'
      } else if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão ou CORS. Verifique sua rede e tente novamente.'
      } else {
        errorMessage = getErrorMessage(err) || errorMessage
      }
      setError(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isSending && inputText.trim()) {
        handleSend()
      }
    }
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const alturaContainer = embedded ? 'h-[70vh]' : 'h-[calc(100vh-4rem)]'

  if (loadingSession) {
    return (
      <div className={cn('flex items-center justify-center flex-col gap-4 bg-white', alturaContainer)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Iniciando conversa...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={cn('flex items-center justify-center flex-col gap-4 bg-white px-4 text-center', alturaContainer)}>
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <p className="text-base font-medium text-foreground">{loadError}</p>
        <Button onClick={initSession} variant="default" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col max-w-4xl mx-auto w-full bg-white relative',
        alturaContainer,
        !embedded && 'md:border-x md:border-[#E8E8E8]',
        embedded && 'rounded-xl border border-[#E8E8E8]',
      )}
    >
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground text-center text-xs py-1.5 font-medium w-full z-10 animate-fade-in-down">
          Você está offline. Verifique sua conexão. O modo offline permite ler o histórico.
        </div>
      )}
      {!embedded && (
        <div className="flex-none p-4 md:p-6 border-b border-[#E8E8E8] bg-white flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              Suporte - Clínica Canever
              {!isOnline && <span className="flex h-2 w-2 rounded-full bg-destructive" />}
            </h1>
            <p className="text-sm text-foreground/70 mt-1">Converse com nosso assistente</p>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {mensagens.length === 0 && (
            <div className="text-center text-foreground/70 text-sm my-8">
              Nenhuma mensagem ainda. Envie uma mensagem para iniciar o atendimento.
            </div>
          )}
          {mensagens.map((msg, index) => {
            const isPatient = msg.remetente === 'paciente'
            const uniqueKey = msg.id ? msg.id : `temp-msg-${msg.created || 'no-date'}-${index}`
            return (
              <div
                key={uniqueKey}
                className={cn(
                  'flex flex-col max-w-[85%] sm:max-w-[75%] space-y-1.5',
                  isPatient ? 'ml-auto items-end' : 'mr-auto items-start',
                )}
              >
                <span className="text-xs font-medium text-foreground/70 px-1">
                  {isPatient ? 'Você' : 'Assistente'}
                </span>
                <div
                  className={cn(
                    'px-4 py-2.5 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap text-foreground',
                    isPatient
                      ? 'bg-primary/15 rounded-2xl rounded-tr-sm'
                      : 'bg-[#E8E8E8] rounded-2xl rounded-tl-sm',
                  )}
                >
                  {msg.conteudo}
                </div>
                {!isPatient && onSaveDieta && msg.conteudo.length > 400 && (
                  <button
                    onClick={() => onSaveDieta(msg.conteudo)}
                    className="text-xs font-medium text-primary hover:underline px-1 flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar como dieta
                  </button>
                )}
                <span className="text-[11px] text-foreground/60 px-1">
                  {msg.created ? formatTime(msg.created) : 'agora'}
                </span>
              </div>
            )
          })}

          {isTyping && (
            <div className="mr-auto max-w-[85%] sm:max-w-[75%] space-y-1.5">
              <span className="text-xs font-medium text-foreground/70 px-1">Dr. Márcio</span>
              <div className="px-4 py-3 bg-[#E8E8E8] text-foreground rounded-2xl rounded-tl-sm w-fit shadow-sm flex items-center space-x-1.5 h-11">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span className="text-[11px] text-foreground/60 px-1 block mt-1">
                Dr. Márcio está digitando...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {error && (
        <div className="p-4 border-t border-[#E8E8E8] bg-destructive/5 animate-fade-in">
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">Erro</AlertTitle>
            <AlertDescription className="text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
              <span className="break-all line-clamp-2">{error}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={retryAI}
                disabled={isSending}
                className="shrink-0 w-fit bg-white hover:bg-black/5"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-4 md:p-6 border-t border-[#E8E8E8] bg-white">
        <div className="flex gap-3 items-end">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOnline ? 'Digite sua mensagem...' : 'Você está offline...'}
            className="min-h-[56px] max-h-32 resize-none rounded-xl border-[#E8E8E8] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-white text-foreground disabled:opacity-50"
            disabled={isSending || !isOnline}
          />
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shrink-0 shadow-md bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            onClick={handleSend}
            disabled={!inputText.trim() || isSending || !isOnline}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 ml-1 text-white" />
            )}
          </Button>
        </div>
        <p className="text-xs text-foreground/60 mt-3 text-center sm:text-left">
          Pressione <strong className="font-medium text-foreground">Enter</strong> para enviar,{' '}
          <strong className="font-medium text-foreground">Shift + Enter</strong> para nova linha.
        </p>
      </div>
    </div>
  )
}
