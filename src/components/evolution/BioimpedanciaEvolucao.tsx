import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { BioimpedanciaPdf } from '@/services/clinical'

const fmtData = (s: string) => {
  const d = new Date(s.replace(' ', 'T'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// num > 0 ? num : null (0/vazio = sem dado, p/ não plotar como zero)
const v = (n: number | undefined) => (n && n > 0 ? n : null)

type Metrica = {
  chave: 'peso' | 'massa_muscular' | 'massa_gordura' | 'percentual_gordura'
  label: string
  unidade: string
  cor: string
  // direção desejada: 'up' = aumentar é bom; 'down' = diminuir é bom; 'neutro'
  bom: 'up' | 'down' | 'neutro'
}

const METRICAS: Metrica[] = [
  { chave: 'massa_muscular', label: 'Massa muscular', unidade: 'kg', cor: '#16a34a', bom: 'up' },
  { chave: 'massa_gordura', label: 'Massa de gordura', unidade: 'kg', cor: '#dc2626', bom: 'down' },
  { chave: 'percentual_gordura', label: '% Gordura', unidade: '%', cor: '#ea580c', bom: 'down' },
  { chave: 'peso', label: 'Peso', unidade: 'kg', cor: '#2563eb', bom: 'neutro' },
]

export function BioimpedanciaEvolucao({ dados }: { dados: BioimpedanciaPdf[] }) {
  // ordena por data crescente
  const ordenado = useMemo(
    () =>
      [...dados].sort(
        (a, b) => new Date(a.data_medicao).getTime() - new Date(b.data_medicao).getTime(),
      ),
    [dados],
  )

  const chartData = useMemo(
    () =>
      ordenado.map((b) => ({
        data: fmtData(b.data_medicao),
        peso: v(b.peso),
        massa_muscular: v(b.massa_muscular),
        massa_gordura: v(b.massa_gordura),
        percentual_gordura: v(b.percentual_gordura),
      })),
    [ordenado],
  )

  // primeiro e último valor de cada métrica (só medições que têm o valor)
  const comparativo = useMemo(() => {
    return METRICAS.map((m) => {
      const valores = ordenado
        .map((b) => ({ data: b.data_medicao, val: b[m.chave] as number }))
        .filter((x) => x.val && x.val > 0)
      if (valores.length === 0) return { m, primeiro: null, ultimo: null, delta: null }
      const primeiro = valores[0]
      const ultimo = valores[valores.length - 1]
      const delta = valores.length >= 2 ? ultimo.val - primeiro.val : null
      return { m, primeiro, ultimo, delta }
    })
  }, [ordenado])

  const temAlgumDado = chartData.some(
    (d) => d.peso || d.massa_muscular || d.massa_gordura || d.percentual_gordura,
  )

  if (!temAlgumDado) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução da composição corporal</CardTitle>
        <CardDescription>Comparativo entre a primeira e a última medição.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cards de diferença (antes x depois) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {comparativo.map(({ m, primeiro, ultimo, delta }) => {
            const positivoBom =
              delta != null &&
              ((m.bom === 'up' && delta > 0) || (m.bom === 'down' && delta < 0))
            const negativoBom =
              delta != null &&
              ((m.bom === 'up' && delta < 0) || (m.bom === 'down' && delta > 0))
            const corDelta =
              delta == null || m.bom === 'neutro'
                ? 'text-muted-foreground'
                : positivoBom
                  ? 'text-green-600'
                  : negativoBom
                    ? 'text-red-600'
                    : 'text-muted-foreground'
            const Icone = delta == null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown
            return (
              <div key={m.chave} className="rounded-lg border p-3 bg-card">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold" style={{ color: m.cor }}>
                  {ultimo ? `${ultimo.val} ${m.unidade}` : '—'}
                </p>
                {delta != null ? (
                  <p className={`text-xs font-medium flex items-center gap-1 ${corDelta}`}>
                    <Icone className="w-3 h-3" />
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(1)} {m.unidade} vs início
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {primeiro ? 'só 1 medição' : 'sem dados'}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Gráfico */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="data" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="kg" tick={{ fontSize: 12 }} unit=" kg" width={56} />
              <YAxis
                yAxisId="pct"
                orientation="right"
                tick={{ fontSize: 12 }}
                unit="%"
                width={44}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="kg"
                type="monotone"
                dataKey="peso"
                name="Peso (kg)"
                stroke="#2563eb"
                strokeWidth={2}
                connectNulls
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="kg"
                type="monotone"
                dataKey="massa_muscular"
                name="Massa muscular (kg)"
                stroke="#16a34a"
                strokeWidth={2}
                connectNulls
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="kg"
                type="monotone"
                dataKey="massa_gordura"
                name="Massa de gordura (kg)"
                stroke="#dc2626"
                strokeWidth={2}
                connectNulls
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="pct"
                type="monotone"
                dataKey="percentual_gordura"
                name="% Gordura"
                stroke="#ea580c"
                strokeWidth={2}
                strokeDasharray="5 4"
                connectNulls
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
