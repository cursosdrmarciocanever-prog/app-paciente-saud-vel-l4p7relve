import { z } from 'zod'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export const CategoriaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'O nome da categoria é obrigatório'),
  descricao: z.string().optional().or(z.literal('')),
  icone: z.string().optional().or(z.literal('')),
})

export type Categoria = z.infer<typeof CategoriaSchema>

export const ArtigoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, 'O título é obrigatório'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  conteudo: z.string().min(1, 'O conteúdo é obrigatório'),
  categoria_id: z.string().min(1, 'A categoria é obrigatória'),
  autor: z.string().default('Dr. Márcio Canever'),
  imagem_url: z.string().url('Formato de URL inválido').optional().or(z.literal('')),
  publicado: z.boolean().default(false),
  data_publicacao: z.string().optional().or(z.literal('')),
  visualizacoes: z.number().int().default(0),
})

export type Artigo = z.infer<typeof ArtigoSchema>

export const VideoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, 'O título é obrigatório'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  url_youtube: z.string().url('URL inválida').min(1, 'A URL do YouTube é obrigatória'),
  categoria_id: z.string().min(1, 'A categoria é obrigatória'),
  autor: z.string().default('Dr. Márcio Canever'),
  thumbnail_url: z.string().url('Formato de URL inválido').optional().or(z.literal('')),
  publicado: z.boolean().default(false),
  data_publicacao: z.string().optional().or(z.literal('')),
  visualizacoes: z.number().int().default(0),
  duracao_minutos: z.number().int().optional(),
})

export type Video = z.infer<typeof VideoSchema>

// Categorias CRUD
export const getCategorias = async () => {
  try {
    return await pb.collection('categorias_conteudo').getFullList<Categoria>({ sort: 'nome' })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    throw error
  }
}

export const createCategoria = async (data: Categoria) => {
  try {
    const validData = CategoriaSchema.parse(data)
    return await pb.collection('categorias_conteudo').create<Categoria>(validData)
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    throw error
  }
}

// Artigos CRUD
export const getArtigos = async (options?: { filter?: string; sort?: string; expand?: string }) => {
  try {
    return await pb.collection('artigos').getFullList<Artigo>(options)
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    throw error
  }
}

export const getArtigo = async (id: string, options?: { expand?: string }) => {
  try {
    return await pb.collection('artigos').getOne<Artigo>(id, options)
  } catch (error) {
    console.error(`Erro ao buscar artigo ${id}:`, error)
    throw error
  }
}

export const createArtigo = async (data: Artigo) => {
  try {
    const validData = ArtigoSchema.parse(data)
    return await pb.collection('artigos').create<Artigo>(validData)
  } catch (error) {
    console.error('Erro ao criar artigo:', error)
    throw error
  }
}

export const updateArtigo = async (id: string, data: Partial<Artigo>) => {
  try {
    const validData = ArtigoSchema.partial().parse(data)
    return await pb.collection('artigos').update<Artigo>(id, validData)
  } catch (error) {
    console.error(`Erro ao atualizar artigo ${id}:`, error)
    throw error
  }
}

export const deleteArtigo = async (id: string) => {
  try {
    return await pb.collection('artigos').delete(id)
  } catch (error) {
    console.error(`Erro ao deletar artigo ${id}:`, error)
    throw error
  }
}

// Vídeos CRUD
export const getVideos = async (options?: { filter?: string; sort?: string; expand?: string }) => {
  try {
    return await pb.collection('videos').getFullList<Video>(options)
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error)
    throw error
  }
}

export const getVideo = async (id: string, options?: { expand?: string }) => {
  try {
    return await pb.collection('videos').getOne<Video>(id, options)
  } catch (error) {
    console.error(`Erro ao buscar vídeo ${id}:`, error)
    throw error
  }
}

export const createVideo = async (data: Video) => {
  try {
    const validData = VideoSchema.parse(data)
    return await pb.collection('videos').create<Video>(validData)
  } catch (error) {
    console.error('Erro ao criar vídeo:', error)
    throw error
  }
}

export const updateVideo = async (id: string, data: Partial<Video>) => {
  try {
    const validData = VideoSchema.partial().parse(data)
    return await pb.collection('videos').update<Video>(id, validData)
  } catch (error) {
    console.error(`Erro ao atualizar vídeo ${id}:`, error)
    throw error
  }
}

export const deleteVideo = async (id: string) => {
  try {
    return await pb.collection('videos').delete(id)
  } catch (error) {
    console.error(`Erro ao deletar vídeo ${id}:`, error)
    throw error
  }
}
