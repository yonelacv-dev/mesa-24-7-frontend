import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/constants/queryKeys'
import type { LookupValues } from '@/shared/types'
import { lookupTicket } from '../services/waitlist.api'
import { saveTurn } from '../services/turn.storage'

export function useTicketLookup(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticket, phone }: LookupValues) => lookupTicket(slug, { ticket: Number(ticket), phone }),
    onSuccess: (entry) => {
      saveTurn(slug, entry.token)
      queryClient.setQueryData(queryKeys.entry(slug, entry.token), entry)
    },
  })
}
