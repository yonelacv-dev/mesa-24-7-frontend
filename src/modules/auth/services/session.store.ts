import type { Session } from '@/shared/types'
import { readJson, removeKey, writeJson } from '@/shared/utils/storage'

const KEY = 'waitlist.host.session'

/**
 * Sesión de la tablet. Vive fuera de React para que el cliente HTTP (que no conoce React) pueda leer el token.
 * La sesión no vence por tiempo: solo se pierde al cerrar sesión o si el back la revoca.
 */
let session = readJson<Session>(KEY)
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

export const sessionStore = {
  get: () => session,
  set(next: Session) {
    session = next
    writeJson(KEY, next)
    emit()
  },
  clear() {
    session = null
    removeKey(KEY)
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
