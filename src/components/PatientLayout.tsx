import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
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
  ChevronLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import logoUrl from '@/assets/captura-de-tela-2026-05-06-as-05.37.05-68d31.png'
import { InstalarAppBanner } from '@/components/InstalarAppBanner'

export function PatientLayout() {
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { title: 'Início', url: '/dashboard', icon: Home },
    { title: 'Meus Agendamentos', url: '/meus-agendamentos', icon: Calendar },
    { title: 'Progresso Clínico', url: '/progresso-clinico', icon: Activity },
    { title: 'Atividade Física', url: '/atividades', icon: Dumbbell },
    { title: 'Nutrição', url: '/nutricao', icon: UtensilsCrossed },
    { title: 'Assistentes', url: '/assistentes', icon: Sparkles },
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
                <SidebarMenuButton asChild>
                  <Link to="/privacidade" className="text-muted-foreground hover:text-foreground">
                    <ShieldCheck />
                    <span>Privacidade e Termos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
          <header
            className="md:hidden border-b border-border bg-background sticky top-0 z-30 shadow-sm"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <div className="h-16 flex items-center px-3 gap-2">
              <SidebarTrigger className="h-11 w-11 shrink-0 text-foreground [&_svg]:size-6" />
              <span className="flex-1 font-bold text-foreground truncate">Clínica Canever</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <InstalarAppBanner />
            <Outlet />
          </main>
        </div>

        {location.pathname !== '/dashboard' && (
          <button
            onClick={() => navigate('/dashboard')}
            aria-label="Voltar para o início"
            className="md:hidden fixed left-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg active:scale-95 transition-transform"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Início</span>
          </button>
        )}

        {/* Botão flutuante de logout (mobile) — canto superior direito */}
        <button
          onClick={() => {
            signOut()
            navigate('/login')
          }}
          aria-label="Sair da conta"
          className="md:hidden fixed right-3 z-50 flex items-center gap-1.5 rounded-full bg-[#EF4444] px-3 py-2 text-white shadow-lg active:scale-95 transition-transform"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.625rem)' }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">Sair</span>
        </button>
      </div>
    </SidebarProvider>
  )
}
