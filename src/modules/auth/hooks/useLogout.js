import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logout } from '../services/auth.api'
import { sessionStore } from '../services/session.store'

/** Cierra solo la sesión de esta tablet. Aunque el back no responda, la sesión local se descarta. */
export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      sessionStore.clear()
      queryClient.clear()
    },
  })
}
