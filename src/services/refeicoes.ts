import pb from '@/lib/pocketbase/client'

export interface Micronutriente {
  nome: string
  quantidade: number
  unidade: string
}

export type TipoRefeicao =
  | 'cafe_da_manha'
  | 'lanche_manha'
  | 'almoco'
  | 'lanche_tarde'
  | 'jantar'
  | 'ceia'

export interface Refeicao {
  id: string
  usuario_id: string
  data: string
  tipo_refeicao: TipoRefeicao
  descricao: string
  calorias?: number
  proteinas?: number
  carboidratos?: number
  gorduras?: number
  micros?: Micronutriente[]
  foto?: string
  horario?: string
  created: string
  updated: string
}

export const TIPO_REFEICAO_LABEL: Record<TipoRefeicao, string> = {
  cafe_da_manha: 'Café da manhã',
  lanche_manha: 'Lanche da manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da tarde',
  jantar: 'Jantar',
  ceia: 'Ceia',
}

// Ordem cronológica para exibir as refeições do dia
export const ORDEM_REFEICAO: TipoRefeicao[] = [
  'cafe_da_manha',
  'lanche_manha',
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia',
]

export const getRefeicoes = async (usuarioId: string) => {
  return pb.collection('refeicoes').getFullList<Refeicao>({
    filter: `usuario_id = "${usuarioId}"`,
    sort: '-data,created',
  })
}

// Cria a refeição. Se houver foto, usa FormData (upload do arquivo); o campo
// `micros` (JSON) é serializado. Caso contrário, envia JSON simples.
export const criarRefeicao = async (data: Partial<Refeicao>, fotoFile?: File) => {
  if (fotoFile) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
    })
    fd.append('foto', fotoFile)
    return pb.collection('refeicoes').create<Refeicao>(fd)
  }
  return pb.collection('refeicoes').create<Refeicao>(data)
}

export const deletarRefeicao = async (id: string) => {
  return pb.collection('refeicoes').delete(id)
}
