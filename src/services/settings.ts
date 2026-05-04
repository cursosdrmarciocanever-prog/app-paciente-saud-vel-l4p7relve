import pb from '@/lib/pocketbase/client'

export interface SettingsRecord {
  id: string
  max_daily_presencial: number
  max_daily_telemedicina: number
  start_time: string
  end_time: string
  created: string
  updated: string
}

export const getSettings = async (): Promise<SettingsRecord | null> => {
  try {
    const records = await pb.collection('settings').getFullList<SettingsRecord>()
    if (records.length > 0) return records[0]
    return null
  } catch (e) {
    console.error('Error fetching settings:', e)
    return null
  }
}
