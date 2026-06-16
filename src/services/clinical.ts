import pb from '@/lib/pocketbase/client'

export interface FotoPaciente {
  id: string
  usuario_id: string
  foto: string
  descricao: string
  created: string
}

export interface ExamePdf {
  id: string
  usuario_id: string
  nome_exame: string
  arquivo: string
  tamanho_bytes: number
  data_exame: string
  tipo_exame: 'sangue' | 'imagem' | 'outro'
  created: string
}

export interface BioimpedanciaPdf {
  id: string
  usuario_id: string
  arquivo: string
  tamanho_bytes: number
  data_medicao: string
  peso: number
  massa_muscular: number
  massa_gordura: number
  massa_magra: number
  percentual_gordura: number
  created: string
}

// Fotos
export const getFotos = async (usuarioId: string): Promise<FotoPaciente[]> => {
  try {
    return await pb.collection('fotos_paciente').getFullList({
      filter: `usuario_id = "${usuarioId}"`,
      sort: '-created',
    })
  } catch (error) {
    console.error('Error fetching photos', error)
    throw error
  }
}

export const createFoto = async (data: FormData): Promise<FotoPaciente> => {
  try {
    return await pb.collection('fotos_paciente').create(data)
  } catch (error) {
    console.error('Error creating photo', error)
    throw error
  }
}

export const deleteFoto = async (id: string): Promise<boolean> => {
  try {
    return await pb.collection('fotos_paciente').delete(id)
  } catch (error) {
    console.error('Error deleting photo', error)
    throw error
  }
}

// Exames
export const getExames = async (usuarioId: string): Promise<ExamePdf[]> => {
  try {
    return await pb.collection('exames_pdf').getFullList({
      filter: `usuario_id = "${usuarioId}"`,
      sort: '-data_exame',
    })
  } catch (error) {
    console.error('Error fetching exams', error)
    throw error
  }
}

export const createExame = async (data: FormData): Promise<ExamePdf> => {
  try {
    return await pb.collection('exames_pdf').create(data)
  } catch (error) {
    console.error('Error creating exam', error)
    throw error
  }
}

export const deleteExame = async (id: string): Promise<boolean> => {
  try {
    return await pb.collection('exames_pdf').delete(id)
  } catch (error) {
    console.error('Error deleting exam', error)
    throw error
  }
}

// Bioimpedância
export const getBioimpedancias = async (usuarioId: string): Promise<BioimpedanciaPdf[]> => {
  try {
    return await pb.collection('bioimpedancia_pdf').getFullList({
      filter: `usuario_id = "${usuarioId}"`,
      sort: '-data_medicao',
    })
  } catch (error) {
    console.error('Error fetching bioimpedance', error)
    throw error
  }
}

export const createBioimpedancia = async (data: FormData): Promise<BioimpedanciaPdf> => {
  try {
    return await pb.collection('bioimpedancia_pdf').create(data)
  } catch (error) {
    console.error('Error creating bioimpedance', error)
    throw error
  }
}

export const deleteBioimpedancia = async (id: string): Promise<boolean> => {
  try {
    return await pb.collection('bioimpedancia_pdf').delete(id)
  } catch (error) {
    console.error('Error deleting bioimpedance', error)
    throw error
  }
}

export const getFileUrl = (collection: string, recordId: string, filename: string) => {
  return pb.files.getUrl({ collectionId: collection, id: recordId } as any, filename)
}
