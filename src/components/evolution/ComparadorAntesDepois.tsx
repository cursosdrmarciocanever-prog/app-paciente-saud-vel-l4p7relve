import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export interface ItemComparacao {
  id: string
  titulo: string
  url: string
  isPdf: boolean
}

// Baixa o arquivo como blob (driblando o CSP "sandbox" do PocketBase) e exibe.
function Painel({ item, vazio }: { item?: ItemComparacao; vazio: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) {
      setBlobUrl(null)
      return
    }
    let revoked = false
    let criada: string | null = null
    setLoading(true)
    setBlobUrl(null)
    fetch(item.url)
      .then((r) => r.blob())
      .then((b) => {
        if (revoked) return
        criada = URL.createObjectURL(b)
        setBlobUrl(criada)
      })
      .catch(() => {})
      .finally(() => !revoked && setLoading(false))
    return () => {
      revoked = true
      if (criada) URL.revokeObjectURL(criada)
    }
  }, [item?.url])

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm font-medium text-center py-2 border-b truncate px-2">
        {item ? item.titulo : vazio}
      </div>
      <div className="flex-1 min-h-0 bg-muted">
        {!item ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            {vazio}
          </div>
        ) : loading || !blobUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : item.isPdf ? (
          <iframe src={blobUrl} title={item.titulo} className="w-full h-full" />
        ) : (
          <div className="w-full h-full overflow-auto flex items-center justify-center bg-black/5">
            <img
              src={blobUrl}
              alt={item.titulo}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function ComparadorAntesDepois({ itens }: { itens: ItemComparacao[] }) {
  // ordena do mais antigo para o mais recente é responsabilidade de quem passa;
  // por padrão: Antes = primeiro, Depois = último
  const [antesId, setAntesId] = useState('')
  const [depoisId, setDepoisId] = useState('')

  useEffect(() => {
    if (itens.length >= 2) {
      setAntesId((id) => id || itens[0].id)
      setDepoisId((id) => id || itens[itens.length - 1].id)
    }
  }, [itens])

  if (itens.length < 2) {
    return (
      <p className="text-muted-foreground text-sm">
        É preciso ter pelo menos 2 registros para comparar antes e depois.
      </p>
    )
  }

  const antes = itens.find((i) => i.id === antesId)
  const depois = itens.find((i) => i.id === depoisId)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Antes</Label>
          <Select value={antesId} onValueChange={setAntesId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {itens.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Depois</Label>
          <Select value={depoisId} onValueChange={setDepoisId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {itens.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[70vh]">
        <div className="rounded-md border overflow-hidden">
          <Painel item={antes} vazio="Selecione o registro 'Antes'" />
        </div>
        <div className="rounded-md border overflow-hidden">
          <Painel item={depois} vazio="Selecione o registro 'Depois'" />
        </div>
      </div>
    </div>
  )
}
