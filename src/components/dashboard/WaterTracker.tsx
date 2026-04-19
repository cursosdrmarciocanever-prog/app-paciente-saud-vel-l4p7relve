import { useState } from 'react'
import { Droplet, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function WaterTracker() {
  const [water, setWater] = useState(1250)
  const goal = 2500
  const { toast } = useToast()

  const addWater = () => {
    setWater((prev) => {
      const next = Math.min(prev + 250, goal)
      if (next === goal && prev < goal) {
        toast({ title: 'Parabéns! 💧', description: 'Você atingiu sua meta diária de água!' })
      } else {
        toast({
          title: 'Água registrada',
          description: '+250ml adicionados com sucesso.',
          duration: 2000,
        })
      }
      return next
    })
  }

  const percentage = Math.round((water / goal) * 100)

  return (
    <Card className="h-full border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/20" />
          Hidratação Diária
        </CardTitle>
        <CardDescription>Sua meta é de {goal}ml por dia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-6 mt-2">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-500/10">
            <div
              className="absolute bottom-0 w-full bg-blue-500/20 rounded-b-full transition-all duration-500 ease-out"
              style={{ height: `${percentage}%` }}
            />
            <div className="text-center z-10">
              <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>{water}ml ingeridos</span>
              <span>{goal}ml</span>
            </div>
            <Progress
              value={percentage}
              className="h-2 bg-blue-100 dark:bg-blue-950 [&>div]:bg-blue-500"
            />
          </div>

          <Button
            onClick={addWater}
            disabled={water >= goal}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Copo (250ml)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
