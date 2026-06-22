import pb from './client'

// Arquivos clínicos (fotos/exames/bioimpedância) são PROTEGIDOS no PocketBase:
// o acesso ao arquivo exige um token de curta duração (?token=...).
// Mantemos um token em cache e o renovamos periodicamente.
let token = ''
let fetchedAt = 0
const TTL_MS = 90_000 // renova a cada 90s (o token do PB dura ~2-3min)

export async function ensureFileToken(): Promise<string> {
  if (!pb.authStore.isValid) {
    token = ''
    return token
  }
  if (!token || Date.now() - fetchedAt > TTL_MS) {
    try {
      token = await pb.files.getToken()
      fetchedAt = Date.now()
    } catch (_) {
      /* mantém o token anterior */
    }
  }
  return token
}

export function currentFileToken(): string {
  return token
}

// Renovação em segundo plano enquanto o app estiver aberto e autenticado.
let intervalo: ReturnType<typeof setInterval> | null = null
export function startFileTokenRefresh() {
  ensureFileToken()
  if (intervalo) return
  intervalo = setInterval(() => {
    ensureFileToken()
  }, TTL_MS)
}

// Acrescenta o token à URL de um arquivo protegido.
export function comToken(url: string): string {
  const t = currentFileToken()
  if (!t) return url
  return url + (url.includes('?') ? '&' : '?') + 'token=' + t
}
