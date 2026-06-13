import { Artigo, Video, Categoria } from '@/services/conteudo'

export type ArtigoExpandido = Artigo & {
  id: string
  created: string
  expand?: { categoria_id?: Categoria }
}

export type VideoExpandido = Video & {
  id: string
  created: string
  expand?: { categoria_id?: Categoria }
}

export type CategoriaComId = Categoria & { id: string }
