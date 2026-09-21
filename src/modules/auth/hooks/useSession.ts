import { useSyncExternalStore } from 'react'

import { sessionStore } from '../services/session.store'

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get)
}
