import pb from '@/lib/pocketbase/client'

export interface AnaliseFoto {
  descricao: string
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
  confianca: 'alta' | 'media' | 'baixa'
  observacao: string
}

/**
 * Redimensiona a foto no navegador antes de enviar (lado maior <= 1024px,
 * JPEG qualidade 0.7) para manter o payload pequeno e a análise rápida.
 * Retorna uma data URL "data:image/jpeg;base64,...".
 */
const redimensionarParaDataUrl = (file: File, maxLado = 1024): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxLado || height > maxLado) {
        if (width >= height) {
          height = Math.round((height * maxLado) / width)
          width = maxLado
        } else {
          width = Math.round((width * maxLado) / height)
          height = maxLado
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas indisponível'))
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('imagem inválida'))
    }
    img.src = url
  })

/**
 * Envia a foto do prato para análise nutricional por IA (visão).
 * Lança Error com mensagem amigável vinda do backend quando algo falha.
 */
export const analisarFotoPrato = async (file: File): Promise<AnaliseFoto> => {
  const imagem = await redimensionarParaDataUrl(file)
  try {
    return await pb.send<AnaliseFoto>('/backend/v1/nutricao/analisar-foto', {
      method: 'POST',
      body: { imagem },
    })
  } catch (err: any) {
    const msg = err?.response?.erro || err?.data?.erro || err?.message || 'Não foi possível analisar a foto.'
    throw new Error(String(msg))
  }
}
