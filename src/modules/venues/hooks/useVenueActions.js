import { useMutation, useQueryClient } from '@tanstack/react-query'

import { pauseVenue, resumeVenue, saveSchedule } from '../services/venues.api'
import { queryKeys } from '@/shared/constants/queryKeys'

/** Pausar, reanudar y guardar el horario. El back avisa por SSE; aquí además se refresca la cola por si acaso. */
export function useVenueActions(slug) {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.hostQueue(slug) })
    queryClient.invalidateQueries({ queryKey: queryKeys.venueStatus(slug) })
  }

  const togglePause = useMutation({
    mutationFn: (paused) => (paused ? pauseVenue(slug) : resumeVenue(slug)),
    onSuccess: refresh,
  })
  const updateSchedule = useMutation({
    mutationFn: (body) => saveSchedule(slug, body),
    onSuccess: refresh,
  })
  return { togglePause, updateSchedule }
}
