import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const measurements = [
  { part: 'Cintura', start: 95, current: 82, diff: -13 },
  { part: 'Quadril', start: 110, current: 102, diff: -8 },
  { part: 'Busto/Tórax', start: 100, current: 94, diff: -6 },
  { part: 'Braço Dir.', start: 32, current: 29, diff: -3 },
  { part: 'Coxa Dir.', start: 65, current: 59, diff: -6 },
]

export function MeasurementsTable() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Medidas Corporais (cm)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Região</TableHead>
                <TableHead className="text-right">Início</TableHead>
                <TableHead className="text-right">Atual</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{m.part}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{m.start}</TableCell>
                  <TableCell className="text-right font-semibold">{m.current}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 font-bold"
                    >
                      {m.diff} cm
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
