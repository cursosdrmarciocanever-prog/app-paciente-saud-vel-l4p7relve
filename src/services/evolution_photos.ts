import pb from '@/lib/pocketbase/client'

export interface EvolutionPhotoRecord {
  id: string
  user: string
  photo: string
  date: string
  angle: 'Frente' | 'Lado' | 'Costas'
  created: string
  updated: string
}

export const getEvolutionPhotos = () =>
  pb.collection('evolution_photos').getFullList<EvolutionPhotoRecord>({ sort: '-date' })

export const createEvolutionPhoto = (data: FormData, options?: any) =>
  pb.collection('evolution_photos').create<EvolutionPhotoRecord>(data, options)

export const getPhotoUrl = (recordId: string, fileName: string) => {
  if (!fileName) return ''
  return pb.files.getURL(
    { id: recordId, collectionId: 'evolution_photos', collectionName: 'evolution_photos' } as any,
    fileName,
  )
}
