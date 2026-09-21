import { useMutation } from '@tanstack/react-query'

import { login } from '../services/auth.api'
import { sessionStore } from '../services/session.store'

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => sessionStore.set({ token, user }),
  })
}
