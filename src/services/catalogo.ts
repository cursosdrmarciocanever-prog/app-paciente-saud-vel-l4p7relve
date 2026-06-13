import pb from '@/lib/pocketbase/client'

export interface CatalogoInjetavel {
  id: string
  produto: string
  tipo?: string
  funcao?: string
  via_administracao?: string
  ponsologia_recomendada?: string
  valor?: number
  ativo: boolean
  created: string
  updated: string
}

export const getCatalogoInjetaveis = async (): Promise<CatalogoInjetavel[]> => {
  try {
    return await pb.collection('catalogo_injetaveis').getFullList({
      filter: 'ativo = true',
      sort: 'produto',
    })
  } catch (error) {
    console.error('Error fetching catalogo', error)
    throw error
  }
}

export const getAllCatalogoInjetaveis = async (): Promise<CatalogoInjetavel[]> => {
  return await pb.collection('catalogo_injetaveis').getFullList({
    sort: '-created',
  })
}

export const createCatalogoInjetavel = async (
  data: Partial<CatalogoInjetavel>,
): Promise<CatalogoInjetavel> => {
  return await pb.collection('catalogo_injetaveis').create(data)
}

export const updateCatalogoInjetavel = async (
  id: string,
  data: Partial<CatalogoInjetavel>,
): Promise<CatalogoInjetavel> => {
  return await pb.collection('catalogo_injetaveis').update(id, data)
}

export const deleteCatalogoInjetavel = async (id: string): Promise<void> => {
  return await pb.collection('catalogo_injetaveis').delete(id)
}

export const importCatalogoInjetaveis = async (data: {
  items?: any[]
  fileData?: string
  fileName?: string
}): Promise<{ imported: number }> => {
  return await pb.send('/backend/v1/catalogo/import', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
