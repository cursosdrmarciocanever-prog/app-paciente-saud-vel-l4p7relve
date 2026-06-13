import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from '@/components/LoginForm'
import { SignupForm } from '@/components/SignupForm'

export default function Index() {
  const [activeTab, setActiveTab] = useState<string>('login')

  return (
    <Card className="w-full max-w-md bg-gradient-to-b from-primary/10 to-white dark:to-background backdrop-blur-sm shadow-2xl animate-fade-in-up border-border">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-primary">Bem-vindo</CardTitle>
        <CardDescription className="text-base mt-2">
          Acesse sua conta ou crie uma nova
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 items-center rounded-lg bg-muted/50 p-1">
            <TabsTrigger
              value="login"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary h-9 transition-all"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="cadastro"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary h-9 transition-all"
            >
              Cadastro
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="login"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <LoginForm onSwitch={() => setActiveTab('cadastro')} />
          </TabsContent>

          <TabsContent
            value="cadastro"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <SignupForm onSwitch={() => setActiveTab('login')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
