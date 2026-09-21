import { useEffect, useRef, useState } from 'react'

import { openStream } from '@/services/sse'
import type { ConnectionStatus } from '@/shared/types'

interface Options<TMessage extends { event: string; data: unknown }> {
  path: string
  auth?: boolean
  enabled?: boolean
  onMessage: (message: TMessage) => void
}

/**
 * Mantiene abierto un stream SSE mientras `enabled`. Devuelve el estado de la conexión:
 * 'connecting' | 'live' | 'offline' | 'failed'.
 */
export function useEventStream<TMessage extends { event: string; data: unknown }>({
  path,
  auth = false,
  enabled = true,
  onMessage,
}: Options<TMessage>): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const handler = useRef(onMessage)
  useEffect(() => {
    handler.current = onMessage // siempre la versión más reciente, sin reconectar en cada render
  })

  useEffect(() => {
    if (!enabled) return undefined
    return openStream<TMessage>({
      path,
      auth,
      onMessage: (message) => handler.current(message),
      onStatus: setStatus,
    })
  }, [path, auth, enabled])

  return status
}
