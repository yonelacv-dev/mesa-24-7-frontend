import { readJson, removeKey, writeJson } from '@/shared/utils/storage'

/** El navegador recuerda el turno del comensal, por local: al escanear el QR otra vez va directo a su turno. */
const key = (slug: string) => `waitlist.turn.${slug}`

export const loadTurn = (slug: string) => readJson<{ token: string }>(key(slug))?.token ?? null
export const saveTurn = (slug: string, token: string) => writeJson(key(slug), { token })
export const clearTurn = (slug: string) => removeKey(key(slug))
