import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'

import { queryKeys } from '@/shared/constants/queryKeys'
import { useEventStream } from '@/shared/hooks/useEventStream'
import { clockOffset } from '@/shared/utils/time'
import { feedMessage } from '../domain/feed'
import { getHostQueue, hostStreamPath } from '../services/waitlist.api'

const FEED_VISIBLE_MS = 8000

/** La cola de la tablet: lectura, tiempo real (SSE) y el último aviso en vivo. */
export function useHostQueue(slug) {
  const queryClient = useQueryClient()
  const key = queryKeys.hostQueue(slug)
  const [feed, setFeed] = useState(null)
  const counter = useRef(0)

  const query = useQuery({ queryKey: key, queryFn: () => getHostQueue(slug) })

  const connection = useEventStream({
    path: hostStreamPath(slug),
    auth: true,
    onMessage: (event, data) => {
      if (event === 'queue') queryClient.setQueryData(key, data)
      if (event === 'feed') {
        const text = feedMessage(data)
        if (text) setFeed({ id: (counter.current += 1), text })
      }
    },
  })

  useEffect(() => {
    if (!feed) return undefined
    const timer = setTimeout(() => setFeed(null), FEED_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [feed])

  const serverTime = query.data?.server_time
  const offsetMs = useMemo(() => (serverTime ? clockOffset(serverTime) : 0), [serverTime])

  return { queue: query.data, isLoading: query.isPending, error: query.error, connection, feed, offsetMs }
}
