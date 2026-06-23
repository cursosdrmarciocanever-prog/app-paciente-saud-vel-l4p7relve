import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Button } from '@/components/ui/button'
import { Download, Share, X, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'instalar_app_dispensado'

// Banner que convida o paciente a instalar o app na tela de início.
// - Android (Chrome): captura o beforeinstallprompt → botão "Instalar".
// - iOS (Safari): não há prompt nativo → mostra a instrução (Compartilhar → Adicionar à Tela de Início).
// Some sozinho se já está instalado (standalone), no desktop, ou se já foi dispensado.
export function InstalarAppBanner() {
  const [visivel, setVisivel] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Dentro do app nativo (Capacitor) já é um app — nunca mostrar.
    if (Capacitor.isNativePlatform()) return
    // Já instalado / rodando como app?
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (standalone) return
    if (localStorage.getItem(DISMISS_KEY)) return

    const ua = navigator.userAgent || ''
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua)
    if (!mobile) return

    const ios = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      setVisivel(true)
      return
    }

    // Android: aguarda o evento de instalação do Chrome
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisivel(true)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const fechar = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisivel(false)
  }

  const instalar = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    try {
      await deferredPrompt.userChoice
    } catch (_) {
      /* ignora */
    }
    fechar()
  }

  if (!visivel) return null

  return (
    <div className="md:hidden mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Instale o app no seu celular</p>
          {isIOS ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toque em <Share className="inline h-3.5 w-3.5 align-text-bottom" /> Compartilhar e
              depois em <strong>“Adicionar à Tela de Início”</strong> para abrir como um aplicativo.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Acesse mais rápido com o ícone na sua tela inicial.
            </p>
          )}
          {!isIOS && deferredPrompt && (
            <Button size="sm" className="mt-2" onClick={instalar}>
              <Download className="mr-1.5 h-4 w-4" /> Instalar app
            </Button>
          )}
        </div>
        <button
          onClick={fechar}
          aria-label="Fechar"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
