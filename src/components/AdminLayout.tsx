import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
