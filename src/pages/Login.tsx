import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import logoImg from '@/assets/logo-branco-dourado-2-229cd.png'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import pb from '@/lib/pocketbase/client'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true)
    try {
      const { error } = await signIn(values.email, values.password)
      if (error) {
        toast.error('Usuário ou senha incorretos.')
      } else {
        toast.success('Bem-vindo!')
        if (pb.authStore.record?.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      toast.error('Erro inesperado ao fazer login.')
    } finally {
      setLoading(false)
    }
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Email" {...field} className="h-11 bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Senha"
                            {...field}
                            className="h-11 bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-sm"
                  >
                    Entrar
                  </Button>
                </form>
              </Form>
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
