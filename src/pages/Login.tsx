import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    let isValid = true

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
      isValid = false
    }

    if (password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
    } else {
      toast.success('Bem-vindo!')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg bg-white">
        <CardHeader className="space-y-4 flex flex-col items-center pt-8">
          <div className="w-48 h-auto bg-gray-900 p-4 rounded-xl flex items-center justify-center border border-gray-800">
            <img src={logoImg} alt="Clínica Canever" className="w-full object-contain" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900">Bem-vindo(a)</CardTitle>
            <CardDescription className="text-gray-500">
              Faça login para acessar seu painel de evolução.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full mt-4" />
              <div className="flex justify-center mt-6">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-sm text-red-500 px-1">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 px-1">{errors.password}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-sm"
                >
                  Entrar
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
                >
                  Criar conta
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
