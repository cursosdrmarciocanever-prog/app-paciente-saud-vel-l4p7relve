// Service worker mínimo da Área do Paciente (Clínica Canever).
// Estratégia segura para um app com dados sensíveis:
//  - Apenas os assets estáticos com hash (/assets/*) são cacheados (são imutáveis).
//  - HTML (navegações), /api e /backend SEMPRE vão à rede (nunca cacheia dados de paciente).
// Objetivo principal: tornar o app instalável (PWA) e acelerar o carregamento dos assets.

const CACHE = 'canever-assets-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin
  const isAsset = sameOrigin && url.pathname.startsWith('/assets/')

  // Só os assets imutáveis com hash usam cache (cache-first com revalidação).
  if (isAsset) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((resp) => {
            if (resp && resp.status === 200) cache.put(request, resp.clone())
            return resp
          })
          .catch(() => cached)
        return cached || network
      }),
    )
  }
  // Demais requisições (HTML, /api, /backend, etc.): passthrough — sempre rede.
})
