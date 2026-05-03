import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
      isValid = false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
      isValid = false
    }

    if (formData.password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres'
      isValid = false
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'As senhas não conferem'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error } = await signUp(formData)
    if (error) {
      toast.error('Erro ao criar conta. Verifique os dados fornecidos.')
    } else {
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8">
      <Card className="w-full max-w-md border-gray-200 shadow-lg bg-white">
        <CardHeader className="space-y-4 flex flex-col items-center pt-8">
          <div className="w-48 h-auto bg-gray-900 p-4 rounded-xl flex items-center justify-center border border-gray-800">
            <img src={logoImg} alt="Clínica Canever" className="w-full object-contain" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta</CardTitle>
            <CardDescription className="text-gray-500">
              Defina seus dados para iniciar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full mt-4" />
              <div className="flex justify-center mt-6">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <Input
                    name="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 px-1">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-sm text-red-500 px-1">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Input
                    name="password"
                    type="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 px-1">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    name="passwordConfirm"
                    type="password"
                    placeholder="Confirmar senha"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    className={`h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 ${errors.passwordConfirm ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.passwordConfirm && (
                    <p className="text-sm text-red-500 px-1">{errors.passwordConfirm}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-sm mt-2"
                >
                  Criar conta
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
                >
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
