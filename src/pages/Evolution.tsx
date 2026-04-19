import { WeightChart } from '@/components/evolution/WeightChart'
import { MeasurementsTable } from '@/components/evolution/MeasurementsTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function Evolution() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Análise de IMC
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Seu IMC atual é 26.6 (Sobrepeso leve).
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="flex justify-between text-xs font-medium text-blue-800 dark:text-blue-400 mb-2">
                <span>Normal</span>
                <span>Sobrepeso</span>
                <span>Obesidade</span>
              </div>
              <Progress
                value={60}
                className="h-3 bg-white dark:bg-blue-950/50 [&>div]:bg-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <WeightChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeasurementsTable />

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Galeria de Progresso</CardTitle>
              <CardDescription>Suas fotos de antes e depois</CardDescription>
            </div>
            <Button size="icon" variant="outline" className="rounded-full">
              <Camera className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-muted rounded-lg overflow-hidden relative group">
                  <img
                    src="https://img.usecurling.com/p/300/400?q=fitness%20female&color=gray"
                    alt="Antes"
                    className="w-full aspect-[3/4] object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm">
                      Ver Maior
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-medium text-center">Início (Mês 1)</p>
              </div>
              <div className="space-y-2">
                <div className="bg-muted rounded-lg overflow-hidden relative group">
                  <img
                    src="https://img.usecurling.com/p/300/400?q=fitness%20female&color=green"
                    alt="Depois"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm">
                      Ver Maior
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-medium text-center text-primary">Atual (Mês 2)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
