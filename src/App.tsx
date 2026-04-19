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

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/evolucao" element={<Evolution />} />
          <Route path="/alimentacao" element={<Nutrition />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/consultas" element={<Appointments />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
