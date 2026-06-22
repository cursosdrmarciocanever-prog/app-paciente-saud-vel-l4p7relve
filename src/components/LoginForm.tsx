import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

const loginSchema = z.object({
  identity: z.string().min(1, 'Informe o telefone (WhatsApp) ou e-mail'),
  password: z.string().min(1, 'Informe a senha (CPF para novos pacientes)'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSwitch: () => void
}

export function LoginForm({ onSwitch }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const { signIn } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    // Paciente: telefone (WhatsApp) + CPF. Conta antiga: e-mail + senha.
    const isEmail = data.identity.includes('@')
    const identity = isEmail ? data.identity.trim() : data.identity.replace(/\D/g, '')
    const password = isEmail ? data.password : data.password.replace(/\D/g, '')

    const { error } = await signIn({ identity, password })

    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Credenciais inválidas',
        description: 'Confira seu telefone (WhatsApp) e CPF e tente novamente.',
      })
      return
    }

    toast({
      title: 'Login realizado com sucesso',
      description: 'Verificando seu acesso...',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
        <FormField
          control={form.control}
          name="identity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (WhatsApp)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    inputMode="text"
                    placeholder="(00) 00000-0000"
                    className="pl-9 focus-visible:ring-primary"
                    {...field}
                  />
                </div>
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
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Somente os números do CPF"
                    className="pl-9 pr-9 focus-visible:ring-primary"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Pacientes: entre com o <strong>telefone (WhatsApp)</strong> e o <strong>CPF</strong>.
          Contas antigas continuam pelo e-mail e senha.
        </p>
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={onSwitch}
            className="text-sm text-primary hover:text-primary/80"
          >
            Não tem conta? Cadastre-se
          </Button>
        </div>
      </form>
    </Form>
  )
}
