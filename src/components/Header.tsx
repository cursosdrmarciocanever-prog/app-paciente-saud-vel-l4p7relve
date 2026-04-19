import { Bell } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLocation } from 'react-router-dom'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/evolucao': 'Sua Evolução',
  '/alimentacao': 'Plano Alimentar',
  '/biblioteca': 'Biblioteca de Conteúdo',
  '/consultas': 'Consultas e Perfil',
}

export function Header() {
  const location = useLocation()
  const title = routeNames[location.pathname] || 'App Paciente Saudável'

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <SidebarTrigger className="-ml-2 md:hidden" />
      <h1 className="text-lg md:text-xl font-bold text-foreground flex-1 tracking-tight truncate">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground rounded-full"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-background animate-pulse" />
        </Button>
        <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-background shadow-sm">
          <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
          <AvatarFallback className="bg-primary/10 text-primary">MS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
