import { configureApi } from '@/services/api'
import { sessionStore } from './session.store'

/** Conecta el cliente HTTP con la sesión: qué token enviar y qué hacer si el back lo rechaza. */
export function setupAuth() {
  configureApi({
    getToken: () => sessionStore.get()?.token ?? null,
    onUnauthorized: () => sessionStore.clear(),
  })
}
