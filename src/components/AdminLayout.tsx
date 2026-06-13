import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  FileText,
  LogOut,
  Bell,
  Menu,
  Activity,
  Syringe,
  MessageSquare,
} from 'lucide-react'
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import logoUrl from '@/assets/captura-de-tela-2026-05-06-as-05.37.05-68d31.png'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Horários', path: '/admin/horarios', icon: Calendar },
  { name: 'Usuários', path: '/admin/usuarios', icon: Users },
  { name: 'Assinaturas', path: '/admin/assinaturas', icon: CreditCard },
  { name: 'Conteúdos', path: '/admin/conteudos', icon: FileText },
  { name: 'Bioimpedância', path: '/admin/bioimpedancia', icon: Activity },
  { name: 'Injetáveis', path: '/admin/injetaveis', icon: Syringe },
  { name: 'Suporte', path: '/admin/suporte', icon: MessageSquare },
]

function getTitle(pathname: string) {
  if (pathname.includes('/dashboard')) return 'Dashboard'
  if (pathname.includes('/horarios')) return 'Gestão de Horários'
  if (pathname.includes('/usuarios')) return 'Gestão de Usuários'
  if (pathname.includes('/assinaturas')) return 'Assinaturas'
  if (pathname.includes('/conteudos')) return 'Gestão de Conteúdos'
  if (pathname.includes('/bioimpedancia')) return 'Gestão de Bioimpedância'
  if (pathname.includes('/injetaveis')) return 'Catálogo de Injetáveis'
  if (pathname.includes('/suporte')) return 'Suporte'
  return 'Painel Administrativo'
}

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-border">
      <div className="flex h-20 items-center justify-center border-b border-border p-4">
        <Link
          to="/admin/dashboard"
          onClick={() => setIsMobileOpen(false)}
          className="flex h-full w-full items-center justify-center transition-opacity hover:opacity-80"
          title="Ir para o Dashboard"
        >
          <img
            src={logoUrl}
            alt="Clínica Canever Logo"
            className="max-h-full max-w-full object-contain"
          />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary hover:text-primary',
                )}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary',
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-border p-4">
        <div className="mb-4 flex items-center px-3">
          <div className="ml-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.name || 'Administrador'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground hover:bg-secondary hover:text-primary"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <ProtectedAdminRoute>
      <div className="flex h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden w-[250px] flex-shrink-0 md:block">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-border bg-background px-4 shadow-sm md:px-6">
            <div className="flex items-center">
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                    <Menu className="h-6 w-6 text-foreground" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] p-0">
                  <SheetTitle className="sr-only">Menu Administrativo</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navegação do painel administrativo
                  </SheetDescription>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold text-foreground">
                {getTitle(location.pathname)}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden text-sm text-muted-foreground sm:block">
                {time.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                - {time.toLocaleTimeString('pt-BR')}
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground" disabled>
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificações</span>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  )
}
