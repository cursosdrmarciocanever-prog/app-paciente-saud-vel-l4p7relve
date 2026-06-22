import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, LogOut, Shield, Fingerprint, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function fmtCpf(cpf?: string) {
  const d = (cpf || '').replace(/\D/g, '')
  if (d.length !== 11) return cpf || ''
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function fmtTelefone(tel?: string) {
  const d = (tel || '').replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return tel || ''
}

export default function Perfil() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.substring(0, 2).toUpperCase()
    if (email) return email.substring(0, 2).toUpperCase()
    return 'U'
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-slate-500 mt-1">Visualize e gerencie as informações da sua conta.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Detalhes básicos associados à sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
                {getInitials(user?.name, user?.email)}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {user?.name || 'Usuário Não Informado'}
                </h3>
                <p className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {user?.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                  <Shield className="w-3 h-3" /> Conta Verificada
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="name" value={user?.name || ''} readOnly className="pl-9 bg-slate-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    readOnly
                    className="pl-9 bg-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="cpf"
                    value={fmtCpf((user as { cpf?: string })?.cpf) || 'Não informado'}
                    readOnly
                    className="pl-9 bg-slate-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="telefone"
                    value={
                      fmtTelefone((user as { telefone?: string })?.telefone) || 'Não informado'
                    }
                    readOnly
                    className="pl-9 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4">
                Para alterar seu nome, e-mail ou CPF, entre em contato com o suporte.
              </p>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
