import { Link, useLocation } from 'react-router-dom'
import {
  Users,
  CreditCard,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  PieChart,
  Settings,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: BarChart3 },
  { title: 'Usuários', url: '/admin/usuarios', icon: Users },
  { title: 'Assinaturas', url: '/admin/assinaturas', icon: FileText },
  { title: 'Agendamentos', url: '/admin/consultas', icon: Calendar },
  { title: 'Pagamentos', url: '/admin/pagamentos', icon: CreditCard },
  { title: 'Notificações', url: '/admin/notificacoes', icon: Bell },
  { title: 'Relatórios', url: '/admin/relatorios', icon: PieChart },
  { title: 'Configurações', url: '/admin/configuracoes', icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-border/50 text-center">
        <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-4 px-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (location.pathname.startsWith(item.url) && item.url !== '/admin')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'h-11 transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
