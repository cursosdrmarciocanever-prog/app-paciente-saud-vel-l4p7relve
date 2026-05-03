import {
  LayoutDashboard,
  TrendingDown,
  Utensils,
  BookOpen,
  CalendarDays,
  Activity,
  Image as ImageIcon,
  CreditCard,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Início', url: '/', icon: LayoutDashboard },
  { title: 'Evolução', url: '/evolucao', icon: TrendingDown },
  { title: 'Bioimp.', url: '/bioimpedancia', icon: Activity },
  { title: 'Fotos', url: '/fotos', icon: ImageIcon },
  { title: 'Dieta', url: '/alimentacao', icon: Utensils },
  { title: 'Conteúdo', url: '/biblioteca', icon: BookOpen },
  { title: 'Perfil', url: '/consultas', icon: CalendarDays },
  { title: 'Planos', url: '/planos', icon: CreditCard },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 px-1 py-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] overflow-x-auto">
      <ul className="flex items-center min-w-max px-2 gap-2 sm:gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url
          return (
            <li key={item.title} className="flex-none w-16 sm:w-20">
              <Link
                to={item.url}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 text-[10px] sm:text-xs transition-colors',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon
                  className={cn(
                    'w-6 h-6',
                    isActive && 'scale-110 transition-transform duration-200',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
