import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-4 flex flex-col items-center pt-8">
          <div className="w-48 h-auto bg-primary/5 p-4 rounded-xl flex items-center justify-center border border-primary/10">
            <img src={logoImg} alt="Clínica Canever" className="w-full object-contain" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Bem-vindo(a)</CardTitle>
            <CardDescription>Faça login para acessar seu painel de evolução.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na Plataforma'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
