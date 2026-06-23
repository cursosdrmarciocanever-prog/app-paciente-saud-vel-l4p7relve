import pb from '@/lib/pocketbase/client'

export interface Micronutriente {
  nome: string
  quantidade: number
  unidade: string
}

export interface AnaliseFoto {
  descricao: string
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
  micros: Micronutriente[]
  confianca: 'alta' | 'media' | 'baixa'
  observacao: string
}

/**
 * Redimensiona a foto no navegador (lado maior <= 1024px) e devolve o canvas,
 * reaproveitado tanto para a análise (data URL) quanto para o upload (File).
 */
const redimensionar = (file: File, maxLado = 1024): Promise<HTMLCanvasElement> =>
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
      resolve(canvas)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('imagem inválida'))
    }
    img.src = url
  })

/**
 * Versão redimensionada (JPEG q0.7) como File, para armazenar no Diário sem
 * subir a foto original pesada do celular.
 */
export const prepararFotoParaUpload = async (file: File): Promise<File> => {
  const canvas = await redimensionar(file)
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('falha ao gerar imagem'))), 'image/jpeg', 0.7),
  )
  return new File([blob], 'prato.jpg', { type: 'image/jpeg' })
}

/**
 * Envia a foto do prato para análise nutricional por IA (visão).
 * Lança Error com mensagem amigável vinda do backend quando algo falha.
 */
export const analisarFotoPrato = async (file: File): Promise<AnaliseFoto> => {
  const canvas = await redimensionar(file)
  const imagem = canvas.toDataURL('image/jpeg', 0.7)
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
