import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileUp,
  Image as ImageIcon,
  FileText,
  Activity,
  Trash2,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BioimpedanciaEvolucao } from '@/components/evolution/BioimpedanciaEvolucao'
import {
  getFotos,
  createFoto,
  deleteFoto,
  getExames,
  createExame,
  deleteExame,
  getBioimpedancias,
  createBioimpedancia,
  deleteBioimpedancia,
  getFileUrl,
  FotoPaciente,
  ExamePdf,
  BioimpedanciaPdf,
} from '@/services/clinical'
import { z } from 'zod'

export default function ProgressoClinico() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [fotos, setFotos] = useState<FotoPaciente[]>([])
  const [exames, setExames] = useState<ExamePdf[]>([])
  const [bioimpedancias, setBioimpedancias] = useState<BioimpedanciaPdf[]>([])
  const [loading, setLoading] = useState(true)

  const [uploading, setUploading] = useState(false)
  // Laudo aberto no visualizador (modal)
  const [viewer, setViewer] = useState<{ url: string; titulo: string; isPdf: boolean } | null>(null)
  // O PocketBase serve arquivos com CSP "sandbox", que bloqueia o PDF no iframe.
  // Então baixamos o arquivo como blob e exibimos o blob (não sofre o CSP do servidor).
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [viewerLoading, setViewerLoading] = useState(false)

  const isPdf = (filename: string) => /\.pdf$/i.test(filename)

  useEffect(() => {
    if (!viewer) return
    let revoked = false
    let urlCriada: string | null = null
    setViewerLoading(true)
    setBlobUrl(null)
    fetch(viewer.url)
      .then((r) => r.blob())
      .then((b) => {
        if (revoked) return
        urlCriada = URL.createObjectURL(b)
        setBlobUrl(urlCriada)
      })
      .catch(() => {})
      .finally(() => !revoked && setViewerLoading(false))
    return () => {
      revoked = true
      if (urlCriada) URL.revokeObjectURL(urlCriada)
    }
  }, [viewer])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [f, e, b] = await Promise.all([
        getFotos(user.id),
        getExames(user.id),
        getBioimpedancias(user.id),
      ])
      setFotos(f)
      setExames(e)
      setBioimpedancias(b)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados clínicos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFotoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('foto') as File

    if (!file || file.size === 0)
      return toast({
        title: 'Atenção',
        description: 'Selecione uma imagem ou PDF.',
        variant: 'destructive',
      })
    if (file.size > 50 * 1024 * 1024)
      return toast({
        title: 'Atenção',
        description: 'O arquivo deve ter no máximo 50MB.',
        variant: 'destructive',
      })

    formData.append('usuario_id', user.id)

    setUploading(true)
    try {
      await createFoto(formData)
      toast({ title: 'Sucesso', description: 'Foto salva com sucesso.' })
      loadData()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar foto.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleExameUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('arquivo') as File

    if (!file || file.size === 0)
      return toast({
        title: 'Atenção',
        description: 'Selecione um arquivo.',
        variant: 'destructive',
      })
    if (file.size > 500 * 1024 * 1024)
      return toast({
        title: 'Atenção',
        description: 'O arquivo deve ter no máximo 500MB.',
        variant: 'destructive',
      })

    formData.append('usuario_id', user.id)
    formData.append('tamanho_bytes', file.size.toString())

    setUploading(true)
    try {
      await createExame(formData)
      toast({ title: 'Sucesso', description: 'Exame salvo com sucesso.' })
      loadData()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar exame.', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleBioUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('arquivo') as File

    if (!file || file.size === 0)
      return toast({
        title: 'Atenção',
        description: 'Selecione um arquivo.',
        variant: 'destructive',
      })
    if (file.size > 500 * 1024 * 1024)
      return toast({
        title: 'Atenção',
        description: 'O arquivo deve ter no máximo 500MB.',
        variant: 'destructive',
      })

    formData.append('usuario_id', user.id)
    formData.append('tamanho_bytes', file.size.toString())

    setUploading(true)
    try {
      await createBioimpedancia(formData)
      toast({ title: 'Sucesso', description: 'Bioimpedância salva com sucesso.' })
      loadData()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar bioimpedância.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (type: 'foto' | 'exame' | 'bio', id: string) => {
    if (!confirm('Deseja realmente excluir este item?')) return
    try {
      if (type === 'foto') await deleteFoto(id)
      if (type === 'exame') await deleteExame(id)
      if (type === 'bio') await deleteBioimpedancia(id)
      toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir item.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Progresso Clínico</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe sua evolução e acesse seus exames e laudos.
        </p>
      </div>

      <Tabs defaultValue="fotos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fotos" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Galeria
          </TabsTrigger>
          <TabsTrigger value="exames" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Exames
          </TabsTrigger>
          <TabsTrigger value="bioimpedancia" className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> Bioimpedância
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fotos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Foto</CardTitle>
              <CardDescription>Envie fotos para acompanhar sua evolução corporal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFotoUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="foto">Imagem ou PDF (Máx. 50MB)</Label>
                    <Input
                      id="foto"
                      name="foto"
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição ou Data (Opcional)</Label>
                    <Input id="descricao" name="descricao" placeholder="Ex: Frente - Mês 1" />
                  </div>
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Fazer Upload'} <FileUp className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fotos.map((foto) => {
              const url = getFileUrl('fotos_paciente', foto.id, foto.foto)
              const ehPdf = isPdf(foto.foto)
              return (
                <Card key={foto.id} className="overflow-hidden group">
                  <button
                    type="button"
                    className="aspect-square relative overflow-hidden bg-muted w-full block"
                    onClick={() =>
                      setViewer({ url, titulo: foto.descricao || 'Foto', isPdf: ehPdf })
                    }
                  >
                    {ehPdf ? (
                      <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-muted-foreground">
                        <FileText className="w-12 h-12 text-primary" />
                        <span className="text-xs font-medium">PDF — clique para ver</span>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={foto.descricao}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    )}
                  </button>
                  <div className="relative">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-10 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete('foto', foto.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {foto.descricao && (
                    <div className="p-3 bg-card border-t border-border">
                      <p className="text-sm font-medium">{foto.descricao}</p>
                    </div>
                  )}
                </Card>
              )
            })}
            {fotos.length === 0 && (
              <p className="text-muted-foreground col-span-full">Nenhuma foto enviada ainda.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exames" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Exame</CardTitle>
              <CardDescription>Faça upload de exames laboratoriais ou de imagem.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExameUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_exame">Nome do Exame</Label>
                    <Input
                      id="nome_exame"
                      name="nome_exame"
                      required
                      placeholder="Ex: Hemograma Completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_exame">Data do Exame</Label>
                    <Input id="data_exame" name="data_exame" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_exame">Tipo de Exame</Label>
                    <Select name="tipo_exame" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sangue">Exame de Sangue</SelectItem>
                        <SelectItem value="imagem">Exame de Imagem</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arquivo">Arquivo (PDF ou Imagem, Max 500MB)</Label>
                    <Input id="arquivo" name="arquivo" type="file" accept=".pdf,image/*" required />
                  </div>
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Fazer Upload'} <FileUp className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {exames.map((exame) => (
              <Card key={exame.id} className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{exame.nome_exame}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exame.data_exame).toLocaleDateString('pt-BR')} • {exame.tipo_exame}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      setViewer({
                        url: getFileUrl('exames_pdf', exame.id, exame.arquivo),
                        titulo: exame.nome_exame,
                        isPdf: isPdf(exame.arquivo),
                      })
                    }
                  >
                    <Eye className="w-4 h-4 mr-1" /> Visualizar
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={getFileUrl('exames_pdf', exame.id, exame.arquivo)}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete('exame', exame.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {exames.length === 0 && (
              <p className="text-muted-foreground">Nenhum exame enviado ainda.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bioimpedancia" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Bioimpedância</CardTitle>
              <CardDescription>Envie seus laudos e informe as métricas principais.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBioUpload} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="data_medicao">Data da Medição</Label>
                    <Input id="data_medicao" name="data_medicao" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input id="peso" name="peso" type="number" step="0.1" placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="massa_muscular">Massa Musc. (kg)</Label>
                    <Input
                      id="massa_muscular"
                      name="massa_muscular"
                      type="number"
                      step="0.1"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="massa_gordura">Massa Gordura (kg)</Label>
                    <Input
                      id="massa_gordura"
                      name="massa_gordura"
                      type="number"
                      step="0.1"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentual_gordura">% Gordura</Label>
                    <Input
                      id="percentual_gordura"
                      name="percentual_gordura"
                      type="number"
                      step="0.1"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-3">
                    <Label htmlFor="arquivo">Laudo (PDF ou Imagem, Max 500MB)</Label>
                    <Input id="arquivo" name="arquivo" type="file" accept=".pdf,image/*" required />
                  </div>
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Salvar Registro'}{' '}
                  <FileUp className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <BioimpedanciaEvolucao dados={bioimpedancias} />

          <div className="space-y-4">
            {bioimpedancias.map((bio) => (
              <Card
                key={bio.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Laudo de {new Date(bio.data_medicao).toLocaleDateString('pt-BR')}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {bio.peso > 0 && (
                        <span className="text-sm bg-secondary px-2 py-1 rounded">
                          Peso: {bio.peso}kg
                        </span>
                      )}
                      {bio.massa_muscular > 0 && (
                        <span className="text-sm bg-secondary px-2 py-1 rounded">
                          Massa musc.: {bio.massa_muscular}kg
                        </span>
                      )}
                      {bio.massa_gordura > 0 && (
                        <span className="text-sm bg-secondary px-2 py-1 rounded">
                          Gordura: {bio.massa_gordura}kg
                        </span>
                      )}
                      {bio.percentual_gordura > 0 && (
                        <span className="text-sm bg-secondary px-2 py-1 rounded">
                          % Gordura: {bio.percentual_gordura}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      setViewer({
                        url: getFileUrl('bioimpedancia_pdf', bio.id, bio.arquivo),
                        titulo: `Laudo de ${new Date(bio.data_medicao).toLocaleDateString('pt-BR')}`,
                        isPdf: isPdf(bio.arquivo),
                      })
                    }
                  >
                    <Eye className="w-4 h-4 mr-1" /> Visualizar
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={getFileUrl('bioimpedancia_pdf', bio.id, bio.arquivo)}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete('bio', bio.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {bioimpedancias.length === 0 && (
              <p className="text-muted-foreground">Nenhum laudo enviado ainda.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewer} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col p-4">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{viewer?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 rounded-md overflow-hidden border bg-muted">
            {viewerLoading || !blobUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm">Carregando laudo...</p>
              </div>
            ) : viewer?.isPdf ? (
              <iframe src={blobUrl} title={viewer.titulo} className="w-full h-full" />
            ) : (
              <div className="w-full h-full overflow-auto flex items-center justify-center bg-black/5">
                <img
                  src={blobUrl}
                  alt={viewer?.titulo}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" asChild>
              <a href={viewer?.url} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" /> Abrir em nova aba
              </a>
            </Button>
            <Button asChild>
              <a href={viewer?.url} download>
                <Download className="w-4 h-4 mr-1" /> Baixar
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
