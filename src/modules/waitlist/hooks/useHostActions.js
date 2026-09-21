import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/constants/queryKeys'
import { runHostAction } from '../services/waitlist.api'

/**
 * Llamar, sentar, no vino y quitar. El back responde con la cola ya actualizada.
 * Si la acción ya no es posible (otro anfitrión actuó primero) se recarga la cola para mostrar lo real.
 */
export function useHostActions(slug) {
  const queryClient = useQueryClient()
  const key = queryKeys.hostQueue(slug)

  const mutation = useMutation({
    mutationFn: ({ entryId, action }) => runHostAction(slug, entryId, action),
    onSuccess: (queue) => queryClient.setQueryData(key, queue),
    onError: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return {
    run: (entryId, action) => mutation.mutate({ entryId, action }),
    pendingEntryId: mutation.isPending ? mutation.variables.entryId : null,
    error: mutation.error,
    reset: mutation.reset,
  }
}
