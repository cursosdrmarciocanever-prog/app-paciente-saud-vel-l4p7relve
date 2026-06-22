import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Loader2, Fingerprint, Phone } from 'lucide-react'

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
import { extractFieldErrors } from '@/lib/pocketbase/errors'

// Formata o CPF como 000.000.000-00 enquanto digita
function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function maskTelefone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^\((\d{2})\) (\d{4})(\d)/, '($1) $2-$3')
  }
  return d
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/^\((\d{2})\) (\d{5})(\d)/, '($1) $2-$3')
}

const signupSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  cpf: z
    .string()
    .refine((v) => v.replace(/\D/g, '').length === 11, 'Informe um CPF válido (11 dígitos)'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Informe um telefone (WhatsApp) com DDD'),
})

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSwitch: () => void
}

export function SignupForm({ onSwitch }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signUp } = useAuth()

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      telefone: '',
    },
  })

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)

    // A senha do paciente é o próprio CPF (somente dígitos).
    const cpfDigits = data.cpf.replace(/\D/g, '')
    const { error } = await signUp({
      name: data.name,
      cpf: cpfDigits,
      email: data.email,
      telefone: data.telefone.replace(/\D/g, ''),
      password: cpfDigits,
      passwordConfirm: cpfDigits,
    })

    setIsLoading(false)

    if (error) {
      const fieldErrors = extractFieldErrors(error)
      if (fieldErrors.email) {
        form.setError('email', { message: 'Email já cadastrado' })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: 'Ocorreu um problema no cadastro. Tente novamente.',
        })
      }
      return
    }

    toast({
      title: 'Conta criada com sucesso',
      description: 'Bem-vindo à nossa plataforma!',
    })
    navigate('/planos')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Seu nome"
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
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    className="pl-9 focus-visible:ring-primary"
                    {...field}
                    onChange={(e) => field.onChange(maskCpf(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="seu@email.com"
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
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (WhatsApp)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    className="pl-9 focus-visible:ring-primary"
                    {...field}
                    onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="rounded-lg bg-secondary/40 border border-border p-3">
          <p className="text-xs text-muted-foreground">
            <Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            Sua <strong>senha de acesso será o seu CPF</strong> (somente números). O login é feito
            com o <strong>telefone (WhatsApp)</strong> + CPF.
          </p>
        </div>
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Criando...' : 'Criar Conta'}
        </Button>
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={onSwitch}
            className="text-sm text-primary hover:text-primary/80"
          >
            Já tem conta? Faça login
          </Button>
        </div>
      </form>
    </Form>
  )
}
