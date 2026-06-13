import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Assinaturas from './pages/Assinaturas'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import MeusAgendamentos from './pages/MeusAgendamentos'
import ProgressoClinico from './pages/ProgressoClinico'
import FotosPaciente from './pages/FotosPaciente'
import AtividadeFisica from './pages/AtividadeFisica'
import Alimentacao from './pages/Alimentacao'
import Conquistas from './pages/Conquistas'
import LojaInjetaveis from './pages/LojaInjetaveis'
import CheckoutInjetavel from './pages/CheckoutInjetavel'
import PagamentoInjetavel from './pages/PagamentoInjetavel'
import SucessoInjetavel from './pages/SucessoInjetavel'
import Perfil from './pages/Perfil'
import Suporte from './pages/Suporte'
import SuporteChat from './pages/SuporteChat'
import { AdminLayout } from './components/AdminLayout'
import { PatientLayout } from './components/PatientLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminAssinaturas from './pages/admin/Assinaturas'
import AdminExames from './pages/admin/Exames'
import AgendamentoAdmin from './pages/admin/Agendamento'
import Conteudos from './pages/admin/Conteudos'
import BioimpedanciaAdmin from './pages/admin/Bioimpedancia'
import AdminInjetaveis from './pages/admin/Injetaveis'
import AdminSuporte from './pages/admin/Suporte'
import AgendamentoPaciente from './pages/Agendamento'
import ConfirmarAgendamento from './pages/ConfirmarAgendamento'
import SucessoAgendamento from './pages/SucessoAgendamento'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Biblioteca from './pages/Biblioteca'
import ArtigoDetail from './pages/ArtigoDetail'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

const ProtectedRoute = ({
  children,
  requireSubscription = false,
}: {
  children: React.ReactNode
  requireSubscription?: boolean
}) => {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [subStatus, setSubStatus] = useState<'loading' | 'active' | 'inactive' | 'error'>('loading')

  useEffect(() => {
    if (loading) {
      setSubStatus('loading')
      return
    }

    if (!user) {
      setSubStatus('loading')
      return
    }

    if (user.email === 'admin@canever.com.br' || user.email === 'marciocanever@hotmail.com') {
      setSubStatus('active')
      return
    }

    if (!requireSubscription) {
      setSubStatus('active')
      return
    }

    const checkSub = async () => {
      try {
        const assinaturas = await pb.collection('assinaturas').getFullList({
          filter: `usuario_id = "${user.id}"`,
          sort: '-created',
        })
        const hasActive = assinaturas.some(
          (a) => a.status === 'ativo' || a.status === 'active' || a.status === 'ativa',
        )
        if (hasActive) {
          setSubStatus('active')
        } else {
          toast({
            title: 'Assinatura Necessária',
            description: 'Você precisa de uma assinatura ativa para acessar este conteúdo.',
            variant: 'default',
          })
          setSubStatus('inactive')
        }
      } catch (err) {
        toast({
          title: 'Erro',
          description: 'Não foi possível verificar sua assinatura.',
          variant: 'destructive',
        })
        setSubStatus('error')
      }
    }
    checkSub()
  }, [user, loading, requireSubscription, toast])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-transparent border-t-primary" />
        <p className="text-sm font-medium text-muted-foreground">Verificando acesso...</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  if (requireSubscription) {
    if (subStatus === 'loading') {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-transparent border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">Verificando assinatura...</p>
        </div>
      )
    }
    if (subStatus === 'inactive') return <Navigate to="/assinaturas" replace />
    if (subStatus === 'error') {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center px-4">
          <p className="text-destructive font-medium">
            Ocorreu um erro ao verificar sua assinatura.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor, recarregue a página ou contate o suporte.
          </p>
        </div>
      )
    }
  }

  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-transparent border-t-primary" />
        <p className="text-sm font-medium text-muted-foreground">Preparando seu acesso...</p>
      </div>
    )
  }

  if (user) {
    const userEmail = user.email
    if (userEmail === 'admin@canever.com.br' || userEmail === 'marciocanever@hotmail.com') {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              }
            />
          </Route>

          {/* Authenticated Patient Routes */}
          <Route
            element={
              <ProtectedRoute>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/fotos" element={<FotosPaciente />} />
            <Route path="/atividades" element={<AtividadeFisica />} />
            <Route path="/alimentacao" element={<Alimentacao />} />
            <Route path="/conquistas" element={<Conquistas />} />
            <Route path="/assinaturas" element={<Assinaturas />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
            <Route path="/progresso-clinico" element={<ProgressoClinico />} />
            <Route path="/injetaveis" element={<LojaInjetaveis />} />
            <Route path="/injetaveis/checkout/:id" element={<CheckoutInjetavel />} />
            <Route path="/injetaveis/pagamento/:id" element={<PagamentoInjetavel />} />
            <Route path="/injetaveis/sucesso/:id" element={<SucessoInjetavel />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/suporte" element={<Suporte />} />
            <Route path="/suporte/chat" element={<SuporteChat />} />

            {/* Routes that require active subscription */}
            <Route
              path="/agendamento"
              element={
                <ProtectedRoute requireSubscription>
                  <AgendamentoPaciente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamento/confirmar"
              element={
                <ProtectedRoute requireSubscription>
                  <ConfirmarAgendamento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamento/sucesso"
              element={
                <ProtectedRoute requireSubscription>
                  <SucessoAgendamento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biblioteca"
              element={
                <ProtectedRoute requireSubscription>
                  <Biblioteca />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biblioteca/artigos/:id"
              element={
                <ProtectedRoute requireSubscription>
                  <ArtigoDetail />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="horarios" element={<AgendamentoAdmin />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="assinaturas" element={<AdminAssinaturas />} />
            <Route path="exames" element={<AdminExames />} />
            <Route path="conteudos" element={<Conteudos />} />
            <Route path="bioimpedancia" element={<BioimpedanciaAdmin />} />
            <Route path="injetaveis" element={<AdminInjetaveis />} />
            <Route path="suporte" element={<AdminSuporte />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
