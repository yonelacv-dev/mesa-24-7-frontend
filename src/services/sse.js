import { fetchEventSource } from '@microsoft/fetch-event-source'

import { ApiError, apiUrl, authHeader } from '@/services/api'

const RETRY_MS = 2000
const MAX_RETRY_MS = 15000

class FatalStreamError extends Error {}

/**
 * Abre un stream SSE con fetch (para poder enviar Authorization, que EventSource no permite).
 * Reconecta solo con espera creciente; al reconectar el back manda el estado completo.
 *
 * @param {object} options
 * @param {string} options.path  ruta bajo /api/v1
 * @param {boolean} [options.auth]  enviar el token del anfitrión
 * @param {(event: string, data: any) => void} options.onMessage
 * @param {(status: 'connecting'|'live'|'offline'|'failed', error?: Error) => void} options.onStatus
 * @returns {() => void} función para cerrar el stream
 */
export function openStream({ path, auth = false, onMessage, onStatus }) {
  const controller = new AbortController()
  let attempts = 0
  onStatus('connecting')

  fetchEventSource(apiUrl(path), {
    signal: controller.signal,
    headers: auth ? authHeader() : {},
    openWhenHidden: false, // en segundo plano se cierra; al volver llega el estado completo

    async onopen(response) {
      if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
        attempts = 0
        onStatus('live')
        return
      }
      // 4xx (salvo 429): reintentar no lo arregla (token inválido, turno que no existe...).
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new FatalStreamError(String(response.status))
      }
      throw new Error(`stream ${response.status}`)
    },

    onmessage(message) {
      if (!message.event) return
      try {
        onMessage(message.event, JSON.parse(message.data))
      } catch {
        // un mensaje mal formado no debe tumbar el stream
      }
    },

    onclose() {
      throw new Error('stream cerrado por el servidor') // que reconecte
    },

    onerror(error) {
      if (error instanceof FatalStreamError) {
        onStatus('failed', new ApiError({ status: Number(error.message), code: 'stream_failed', message: 'Stream rechazado' }))
        throw error
      }
      onStatus('offline', error)
      attempts += 1
      return Math.min(RETRY_MS * 2 ** (attempts - 1), MAX_RETRY_MS)
    },
  }).catch(() => {
    // la promesa termina al abortar o ante un error fatal; el estado ya se informó
  })

  return () => controller.abort()
}
