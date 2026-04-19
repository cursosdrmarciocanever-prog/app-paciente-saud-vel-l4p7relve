import { LayoutDashboard, TrendingDown, Utensils, BookOpen, CalendarDays } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
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
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Evolução', url: '/evolucao', icon: TrendingDown },
  { title: 'Alimentação', url: '/alimentacao', icon: Utensils },
  { title: 'Biblioteca', url: '/biblioteca', icon: BookOpen },
  { title: 'Consultas e Perfil', url: '/consultas', icon: CalendarDays },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center justify-center border-b border-border/50">
        <Link
          to="/"
          className="w-full flex justify-center py-2 transition-opacity hover:opacity-90"
        >
          <img src={logoImg} alt="Clínica Canever" className="h-10 object-contain" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-2 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url
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
