import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-background pb-[72px] md:pb-0 relative w-full">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in-up">
          <Outlet />
        </main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  )
}
