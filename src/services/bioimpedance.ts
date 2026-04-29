import pb from '@/lib/pocketbase/client'

export interface BioimpedanceRecord {
  id: string
  user: string
  report: string
  date: string
  notes: string
  created: string
  updated: string
}

export const getBioimpedances = () =>
  pb.collection('bioimpedance').getFullList<BioimpedanceRecord>({ sort: '-date' })

export const createBioimpedance = (data: FormData, options?: any) =>
  pb.collection('bioimpedance').create<BioimpedanceRecord>(data, options)

export const getFileUrl = (recordId: string, fileName: string) => {
  if (!fileName) return ''
  return pb.files.getURL(
    { id: recordId, collectionId: 'bioimpedance', collectionName: 'bioimpedance' } as any,
    fileName,
  )
}
