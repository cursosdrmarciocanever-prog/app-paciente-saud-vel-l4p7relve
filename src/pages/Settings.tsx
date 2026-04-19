import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    weekly_goal: user?.weekly_goal || 3,
    daily_goal_minutes: user?.daily_goal_minutes || 30,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const updatedUser = await pb.collection('users').update(user.id, {
        weekly_goal: formData.weekly_goal,
        daily_goal_minutes: formData.daily_goal_minutes,
      })
      pb.authStore.save(pb.authStore.token, updatedUser)
      toast.success('Metas atualizadas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar as metas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Configurações do Perfil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metas de Atividade Física</CardTitle>
          <CardDescription>
            Ajuste seus objetivos semanais e diários para acompanhar seu progresso no painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekly_goal">Meta Semanal (Dias)</Label>
                <Input
                  id="weekly_goal"
                  name="weekly_goal"
                  type="number"
                  min={1}
                  max={7}
                  value={formData.weekly_goal}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_goal_minutes">Meta Diária (Minutos)</Label>
                <Input
                  id="daily_goal_minutes"
                  name="daily_goal_minutes"
                  type="number"
                  min={1}
                  value={formData.daily_goal_minutes}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
