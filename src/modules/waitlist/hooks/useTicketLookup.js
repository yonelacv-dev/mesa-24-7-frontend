import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/constants/queryKeys'
import { lookupTicket } from '../services/waitlist.api'
import { saveTurn } from '../services/turn.storage'

export function useTicketLookup(slug) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticket, phone }) => lookupTicket(slug, { ticket: Number(ticket), phone }),
    onSuccess: (entry) => {
      saveTurn(slug, entry.token)
      queryClient.setQueryData(queryKeys.entry(slug, entry.token), entry)
    },
  })
}
