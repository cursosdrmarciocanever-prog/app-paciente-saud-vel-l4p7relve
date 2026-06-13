import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import {
  Home,
  Calendar,
  BookOpen,
  CreditCard,
  User,
  LogOut,
  Activity,
  ShoppingBag,
  Camera,
  MessageSquare,
  Dumbbell,
  UtensilsCrossed,
  Trophy,
} from 'lucide-react'
import logoUrl from '@/assets/captura-de-tela-2026-05-06-as-05.37.05-68d31.png'

export function PatientLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { title: 'Início', url: '/dashboard', icon: Home },
    { title: 'Meus Agendamentos', url: '/meus-agendamentos', icon: Calendar },
    { title: 'Progresso Clínico', url: '/progresso-clinico', icon: Activity },
    { title: 'Atividade Física', url: '/atividades', icon: Dumbbell },
    { title: 'Diário Alimentar', url: '/alimentacao', icon: UtensilsCrossed },
    { title: 'Conquistas', url: '/conquistas', icon: Trophy },
    { title: 'Minhas Fotos', url: '/dashboard/fotos', icon: Camera },
    { title: 'Loja de Injetáveis', url: '/injetaveis', icon: ShoppingBag },
    { title: 'Biblioteca de Saúde', url: '/biblioteca', icon: BookOpen },
    { title: 'Suporte', url: '/suporte/chat', icon: MessageSquare },
    { title: 'Minha Assinatura', url: '/assinaturas', icon: CreditCard },
    { title: 'Perfil', url: '/perfil', icon: User },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-3 px-2">
              <img
                src={logoUrl}
                alt="Clínica Canever"
                className="h-9 w-auto object-contain shrink-0"
              />
              <span className="text-lg font-bold text-foreground truncate">Clínica Canever</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          location.pathname === item.url ||
                          (item.url !== '/dashboard' && location.pathname.startsWith(item.url)) ||
                          (item.url === '/suporte/chat' && location.pathname.startsWith('/suporte'))
                        }
                        className="mb-1 transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut()}
                  className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                >
                  <LogOut />
                  <span>Sair da conta</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden relative">
          <header className="h-14 md:hidden border-b border-border bg-background flex items-center px-4 sticky top-0 z-10 shadow-sm">
            <SidebarTrigger className="-ml-2" />
            <span className="ml-2 font-bold text-foreground">Clínica Canever</span>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
