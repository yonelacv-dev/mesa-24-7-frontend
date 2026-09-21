import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/shared/constants/queryKeys'
import { getVenueStatus } from '../services/venues.api'

const REFRESH_MS = 30_000 // la lista abre y cierra con el reloj: se revisa aunque nadie publique nada

export function useVenueStatus(slug: string) {
  return useQuery({
    queryKey: queryKeys.venueStatus(slug),
    queryFn: () => getVenueStatus(slug),
    refetchInterval: REFRESH_MS,
    retry: (count, error) => error.status !== 404 && count < 2,
  })
}
