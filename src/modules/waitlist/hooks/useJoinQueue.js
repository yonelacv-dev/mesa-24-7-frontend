import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/constants/queryKeys'
import { joinQueue } from '../services/waitlist.api'
import { saveTurn } from '../services/turn.storage'

/** "Unirme": el consentimiento va implícito en el botón (el texto está junto a él). */
export function useJoinQueue(slug) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values) => joinQueue(slug, { ...values, consent: true }),
    onSuccess: (entry) => {
      saveTurn(slug, entry.token)
      queryClient.setQueryData(queryKeys.entry(slug, entry.token), entry)
    },
  })
}
