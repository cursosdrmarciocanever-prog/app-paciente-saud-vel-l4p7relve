import pb from '@/lib/pocketbase/client'
import { comToken } from '@/lib/pocketbase/fileToken'

export interface Dieta {
  id: string
  usuario_id: string
  titulo: string
  conteudo: string
  arquivo?: string
  origem?: 'assistente' | 'admin'
  created: string
  updated: string
}

export const getDietas = (usuarioId: string) =>
  pb.collection('dietas').getFullList<Dieta>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-created',
  })

// Cria a dieta. Se houver arquivo (PDF/imagem), usa FormData (upload); senão,
// JSON simples. `conteudo` é opcional quando há arquivo.
export const criarDieta = (
  data: {
    usuario_id: string
    titulo: string
    conteudo?: string
    origem: 'assistente' | 'admin'
  },
  arquivoFile?: File,
) => {
  if (arquivoFile) {
    const fd = new FormData()
    fd.append('usuario_id', data.usuario_id)
    fd.append('titulo', data.titulo)
    fd.append('conteudo', data.conteudo || '')
    fd.append('origem', data.origem)
    fd.append('arquivo', arquivoFile)
    return pb.collection('dietas').create<Dieta>(fd)
  }
  return pb.collection('dietas').create<Dieta>({ ...data, conteudo: data.conteudo || '' })
}

// URL do arquivo da dieta (protegido → com token). Vazio se for dieta só de texto.
export const getDietaArquivoUrl = (d: Dieta): string =>
  d.arquivo ? comToken(pb.files.getURL(d, d.arquivo)) : ''

export const excluirDieta = (id: string) => pb.collection('dietas').delete(id)
