import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Eye, Trash2, X, Utensils, Download } from 'lucide-react'
import { getDietaArquivoUrl, type Dieta } from '@/services/dietas'

interface Props {
  dietas: Dieta[]
  onExcluir?: (id: string) => void
  vazio?: string
}

// Remove marcações de markdown para um PDF limpo.
const limparMarkdown = (txt: string) =>
  txt
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^---+$/gm, '________________________________________')
    .replace(/`/g, '')

const gerarPdfDieta = (dieta: Dieta) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  const pageH = doc.internal.pageSize.getHeight()
  const width = doc.internal.pageSize.getWidth() - margin * 2
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(40, 40, 40)
  doc.text('Clínica Canever', margin, y)
  y += 10
  doc.setDrawColor(212, 165, 116)
  doc.setLineWidth(1.5)
  doc.line(margin, y, margin + width, y)
  y += 24

  doc.setFontSize(13)
  doc.text(dieta.titulo, margin, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(130, 130, 130)
  doc.text(`Gerado em ${new Date(dieta.created).toLocaleDateString('pt-BR')}`, margin, y)
  y += 22

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(10.5)
  const linhas = doc.splitTextToSize(limparMarkdown(dieta.conteudo), width)
  for (const linha of linhas) {
    if (y > pageH - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(linha, margin, y)
    y += 14.5
  }

  const nome = dieta.titulo.replace(/[^\w\s-]/g, '').trim() || 'dieta'
  doc.save(`${nome}.pdf`)
}

export function DietasView({ dietas, onExcluir, vazio }: Props) {
  const [aberta, setAberta] = useState<Dieta | null>(null)

  if (dietas.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-12 text-muted-foreground">
        <Utensils className="w-8 h-8" />
        <p className="text-sm">{vazio || 'Nenhuma dieta disponível ainda.'}</p>
      </div>
    )
  }

  const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '')

  return (
    <>
      <div className="space-y-3">
        {dietas.map((d) => (
          <Card key={d.id} className="flex flex-row items-center justify-between p-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-foreground truncate">{d.titulo}</h3>
                <p className="text-xs text-muted-foreground">
                  {fmt(d.created)}
                  {d.origem === 'admin' ? ' • pela equipe' : d.origem === 'assistente' ? ' • assistente' : ''}
                  {d.arquivo ? ' • PDF' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {d.arquivo ? (
                // Dieta anexada como arquivo (PDF/imagem): abre/baixa o original.
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href={getDietaArquivoUrl(d)} target="_blank" rel="noreferrer">
                      <Eye className="w-4 h-4 mr-1" /> Abrir
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" title="Baixar" asChild>
                    <a href={getDietaArquivoUrl(d)} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </>
              ) : (
                // Dieta em texto: visualizador interno + PDF gerado.
                <>
                  <Button variant="outline" size="sm" onClick={() => setAberta(d)}>
                    <Eye className="w-4 h-4 mr-1" /> Abrir
                  </Button>
                  <Button variant="ghost" size="icon" title="Baixar PDF" onClick={() => gerarPdfDieta(d)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </>
              )}
              {onExcluir && (
                <Button variant="ghost" size="icon" onClick={() => onExcluir(d.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {aberta && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setAberta(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border gap-2">
              <span className="font-semibold text-foreground truncate">{aberta.titulo}</span>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="outline" size="sm" onClick={() => gerarPdfDieta(aberta)}>
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setAberta(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {aberta.conteudo}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
