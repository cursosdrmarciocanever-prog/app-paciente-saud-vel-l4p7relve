import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Dashboard from './pages/Index'
import Evolution from './pages/Evolution'
import Nutrition from './pages/Nutrition'
import Library from './pages/Library'
import Appointments from './pages/Appointments'
import NotFound from './pages/NotFound'
import { AuthProvider, useAuth } from './hooks/use-auth'
import Login from './pages/Login'
import Bioimpedance from './pages/Bioimpedance'
import Photos from './pages/Photos'

const ProtectedRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/evolucao" element={<Evolution />} />
        <Route path="/alimentacao" element={<Nutrition />} />
        <Route path="/biblioteca" element={<Library />} />
        <Route path="/consultas" element={<Appointments />} />
        <Route path="/bioimpedancia" element={<Bioimpedance />} />
        <Route path="/fotos" element={<Photos />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProtectedRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
