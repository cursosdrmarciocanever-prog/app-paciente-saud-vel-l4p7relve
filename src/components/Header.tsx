import { Bell, Check } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLocation, Link } from 'react-router-dom'
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useEffect, useState } from 'react'
import {
  getNotifications,
  markNotificationRead,
  NotificationRecord,
} from '@/services/notifications'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/evolucao': 'Sua Evolução',
  '/alimentacao': 'Plano Alimentar',
  '/biblioteca': 'Biblioteca de Conteúdo',
  '/consultas': 'Consultas e Perfil',
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const title = routeNames[location.pathname] || 'App Paciente Saudável'
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])

  const loadNotifications = () => {
    getNotifications().then(setNotifications).catch(console.error)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useRealtime('notifications', loadNotifications)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <div className="md:hidden flex-1 flex items-center justify-center">
        <Link to="/">
          <img src={logoImg} alt="Clínica Canever" className="h-7 object-contain" />
        </Link>
      </div>
      <h1 className="text-lg md:text-xl font-bold text-foreground flex-1 tracking-tight truncate hidden md:block">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground rounded-full"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold">Notificações</h4>
              <span className="text-xs text-muted-foreground">{unreadCount} não lidas</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex justify-between gap-2">
                      <h5 className="font-medium text-sm mb-1">{n.title}</h5>
                      {!n.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            markNotificationRead(n.id).then(loadNotifications)
                          }}
                        >
                          <Check className="w-3 h-3 text-primary" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                    <span className="text-xs text-muted-foreground/70 mt-2 block">
                      {formatDistanceToNow(parseISO(n.created), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-background shadow-sm transition-transform hover:scale-105">
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
              <AvatarFallback className="bg-primary/10 text-primary">MS</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/configuracoes" className="w-full cursor-pointer">
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
              onClick={() => {
                signOut()
                navigate('/login')
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
