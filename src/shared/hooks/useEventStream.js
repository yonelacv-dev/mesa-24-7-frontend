import { useEffect, useRef, useState } from 'react'

import { openStream } from '@/services/sse'

/**
 * Mantiene abierto un stream SSE mientras `enabled`. Devuelve el estado de la conexión:
 * 'connecting' | 'live' | 'offline' | 'failed'.
 */
export function useEventStream({ path, auth = false, enabled = true, onMessage }) {
  const [status, setStatus] = useState('connecting')
  const handler = useRef(onMessage)
  useEffect(() => {
    handler.current = onMessage // siempre la versión más reciente, sin reconectar en cada render
  })

  useEffect(() => {
    if (!enabled) return undefined
    return openStream({
      path,
      auth,
      onMessage: (event, data) => handler.current?.(event, data),
      onStatus: setStatus,
    })
  }, [path, auth, enabled])

  return status
}
