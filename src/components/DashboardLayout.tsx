import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import {
  Home,
  Calendar,
  BookOpen,
  CreditCard,
  User,
  LogOut,
  HeartPulse,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Início', path: '/dashboard', icon: Home },
    { name: 'Meus Agendamentos', path: '/meus-agendamentos', icon: Calendar },
    { name: 'Biblioteca de Saúde', path: '/biblioteca', icon: BookOpen },
    { name: 'Suporte', path: '/suporte/chat', icon: MessageSquare },
    { name: 'Minha Assinatura', path: '/assinaturas', icon: CreditCard },
    { name: 'Perfil', path: '/perfil', icon: User },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FFFFFF] text-[#4A4A4A] overflow-hidden">
        <Sidebar className="!bg-[#F9F7F4] border-r border-[#E5E0D8]">
          <SidebarHeader className="p-4 flex items-center justify-start gap-2 border-b border-[#E5E0D8]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <HeartPulse className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-[#4A4A4A] tracking-tight">Portal Saúde</span>
          </SidebarHeader>
          <SidebarContent className="!bg-[#F9F7F4]">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive =
                      location.pathname.startsWith(item.path) ||
                      (item.path === '/suporte/chat' && location.pathname.startsWith('/suporte'))
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                          className={cn(
                            'transition-colors font-medium',
                            isActive
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                              : 'text-[#4A4A4A]/70 hover:bg-[#E5E0D8]/50 hover:text-[#4A4A4A]',
                          )}
                        >
                          <Link to={item.path}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-[#E5E0D8] p-4 !bg-[#F9F7F4]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-[#E5E0D8] flex items-center justify-center text-[#4A4A4A] font-semibold shrink-0">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate text-[#4A4A4A]">
                    {user?.name || 'Usuário'}
                  </span>
                  <span className="text-xs text-[#4A4A4A]/70 truncate">{user?.email}</span>
                </div>
              </div>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da conta</span>
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#E5E0D8] bg-[#FFFFFF] px-4 md:px-6 shadow-sm sticky top-0 z-10">
            <SidebarTrigger className="-ml-2 text-[#4A4A4A]" />
            <div className="flex-1 font-semibold text-[#4A4A4A]">
              {navItems.find((i) => location.pathname.startsWith(i.path))?.name || 'Portal'}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 bg-[#FFFFFF]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
