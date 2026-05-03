import pb from '@/lib/pocketbase/client'

export interface VideoRecord {
  id: string
  title: string
  description: string
  thumbnail: string
  video_url: string
  category: string
}

export const getVideos = () =>
  pb.collection('videos').getFullList<VideoRecord>({ sort: '-created' })

export const getVideoThumbnailUrl = (recordId: string, filename: string) =>
  pb.files.getURL({ collectionId: 'videos', id: recordId } as any, filename)
