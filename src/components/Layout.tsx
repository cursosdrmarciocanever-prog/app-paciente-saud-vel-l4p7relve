import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center p-4 md:p-8 bg-background overflow-x-hidden">
      <Outlet />
    </main>
  )
}
