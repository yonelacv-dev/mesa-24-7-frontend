import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

import { queryKeys } from '@/shared/constants/queryKeys'
import { useEventStream } from '@/shared/hooks/useEventStream'
import { clockOffset } from '@/shared/utils/time'
import { cancelEntry, entryStreamPath, getEntry, notifyOnTheWay } from '../services/waitlist.api'
import { clearTurn, saveTurn } from '../services/turn.storage'

/** El turno del comensal: lectura, tiempo real (SSE) y sus dos acciones. */
export function useTurn(slug, token) {
  const queryClient = useQueryClient()
  const key = queryKeys.entry(slug, token)

  const query = useQuery({
    queryKey: key,
    queryFn: () => getEntry(slug, token),
    retry: (count, error) => error.status !== 404 && count < 2,
  })
  const notFound = query.error?.status === 404

  const connection = useEventStream({
    path: entryStreamPath(slug, token),
    enabled: !notFound,
    onMessage: (event, data) => {
      if (event === 'state') queryClient.setQueryData(key, data)
    },
  })

  // Un token que ya no existe se olvida; uno que funciona se recuerda para el próximo escaneo del QR.
  useEffect(() => {
    if (notFound) clearTurn(slug)
    else if (query.data) saveTurn(slug, token)
  }, [notFound, query.data, slug, token])

  const serverTime = query.data?.server_time
  const offsetMs = useMemo(() => (serverTime ? clockOffset(serverTime) : 0), [serverTime])

  const applyEntry = (entry) => queryClient.setQueryData(key, entry)
  const cancel = useMutation({ mutationFn: () => cancelEntry(slug, token), onSuccess: applyEntry })
  const onTheWay = useMutation({ mutationFn: () => notifyOnTheWay(slug, token), onSuccess: applyEntry })

  return {
    entry: query.data,
    isLoading: query.isPending,
    notFound,
    error: query.error,
    connection,
    offsetMs,
    cancel,
    onTheWay,
    forget: () => clearTurn(slug),
  }
}
