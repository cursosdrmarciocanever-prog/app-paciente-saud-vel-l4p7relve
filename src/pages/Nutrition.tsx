import { MealTabs } from '@/components/nutrition/MealTabs'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Nutrition() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seu Plano Alimentar</h2>
          <p className="text-muted-foreground">
            Siga as refeições recomendadas e marque o que já consumiu.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar alimentos ou substituições..."
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <MealTabs />

      <Card className="mt-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-500 shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-semibold text-amber-900 dark:text-amber-400">
              Guia de Substituições
            </h4>
            <p className="text-sm text-amber-800/80 dark:text-amber-500/80">
              Não tem um ingrediente? Veja nossa lista oficial de trocas permitidas.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            Ver Lista
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
