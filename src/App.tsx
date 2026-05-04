import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import Register from './pages/Register'
import PaymentPending from './pages/PaymentPending'
import Settings from './pages/Settings'
import Checkout from './pages/Checkout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminSubscriptions } from './pages/admin/AdminSubscriptions'
import { AdminAppointments } from './pages/admin/AdminAppointments'
import { AdminPayments } from './pages/admin/AdminPayments'
import { AdminNotifications } from './pages/admin/AdminNotifications'
import { AdminSettings } from './pages/admin/AdminSettings'

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route
        path="/admin"
        element={user.role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="assinaturas" element={<AdminSubscriptions />} />
        <Route path="consultas" element={<AdminAppointments />} />
        <Route path="pagamentos" element={<AdminPayments />} />
        <Route path="notificacoes" element={<AdminNotifications />} />
        <Route path="configuracoes" element={<AdminSettings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<Layout />}>
        <Route
          path="/"
          element={user.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />}
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/evolucao" element={<Evolution />} />
        <Route path="/alimentacao" element={<Nutrition />} />
        <Route path="/biblioteca" element={<Library />} />
        <Route path="/consultas" element={<Appointments />} />
        <Route path="/bioimpedancia" element={<Bioimpedance />} />
        <Route path="/fotos" element={<Photos />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/planos" element={<PaymentPending />} />
        <Route path="/checkout/:planId" element={<Checkout />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
)

export default App
