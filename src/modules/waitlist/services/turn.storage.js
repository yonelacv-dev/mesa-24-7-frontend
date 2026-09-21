import { readJson, removeKey, writeJson } from '@/shared/utils/storage'

/** El navegador recuerda el turno del comensal, por local: al escanear el QR otra vez va directo a su turno. */
const key = (slug) => `waitlist.turn.${slug}`

export const loadTurn = (slug) => readJson(key(slug))?.token ?? null
export const saveTurn = (slug, token) => writeJson(key(slug), { token })
export const clearTurn = (slug) => removeKey(key(slug))
