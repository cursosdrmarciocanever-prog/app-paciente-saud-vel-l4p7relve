import pb from '@/lib/pocketbase/client'

export interface Hidratacao {
  id: string
  usuario_id: string
  data: string
  quantidade_ml: number
  meta_ml?: number
  created: string
  updated: string
}

export const META_PADRAO_ML = 2000

// Retorna (ou cria) o registro de hidratação do usuário para o dia informado.
export const getHidratacaoDoDia = async (
  usuarioId: string,
  dia: string,
): Promise<Hidratacao | null> => {
  try {
    return await pb
      .collection('hidratacao')
      .getFirstListItem<Hidratacao>(`usuario_id = "${usuarioId}" && data >= "${dia} 00:00:00" && data <= "${dia} 23:59:59"`)
  } catch (_) {
    return null
  }
}

export const getHistoricoHidratacao = async (usuarioId: string) => {
  return pb.collection('hidratacao').getFullList<Hidratacao>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-data',
  })
}

// Define o total de ml do dia (cria o registro do dia se não existir).
export const setHidratacaoDoDia = async (
  usuarioId: string,
  dia: string,
  quantidadeMl: number,
  metaMl: number = META_PADRAO_ML,
): Promise<Hidratacao> => {
  const existente = await getHidratacaoDoDia(usuarioId, dia)
  if (existente) {
    return pb
      .collection('hidratacao')
      .update<Hidratacao>(existente.id, { quantidade_ml: Math.max(0, quantidadeMl) })
  }
  return pb.collection('hidratacao').create<Hidratacao>({
    usuario_id: usuarioId,
    data: dia,
    quantidade_ml: Math.max(0, quantidadeMl),
    meta_ml: metaMl,
  })
}
