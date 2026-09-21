import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/constants/queryKeys'
import type { ScheduleBody } from '@/shared/types'
import { pauseVenue, resumeVenue, saveSchedule } from '../services/venues.api'

/** Pausar, reanudar y guardar el horario. El back avisa por SSE; aquí además se refresca la cola por si acaso. */
export function useVenueActions(slug: string) {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.hostQueue(slug) })
    queryClient.invalidateQueries({ queryKey: queryKeys.venueStatus(slug) })
  }

  const togglePause = useMutation({
    mutationFn: (paused: boolean) => (paused ? pauseVenue(slug) : resumeVenue(slug)),
    onSuccess: refresh,
  })
  const updateSchedule = useMutation({
    mutationFn: (body: ScheduleBody) => saveSchedule(slug, body),
    onSuccess: refresh,
  })
  return { togglePause, updateSchedule }
}
