import { api } from '@/services/api'
import type { Entry, HostAction, HostQueue, JoinedEntry, JoinValues } from '@/shared/types'

const base = (slug: string) => `/venues/${encodeURIComponent(slug)}`
const entry = (slug: string, token: string) => `${base(slug)}/diner/entries/${encodeURIComponent(token)}`

/* Comensal */
export const joinQueue = (slug: string, body: JoinValues & { consent: boolean }) =>
  api.post<JoinedEntry>(`${base(slug)}/diner/join`, body)
export const lookupTicket = (slug: string, body: { ticket: number; phone: string }) =>
  api.post<Entry>(`${base(slug)}/diner/tickets/lookup`, body)
export const getEntry = (slug: string, token: string) => api.get<Entry>(entry(slug, token))
export const cancelEntry = (slug: string, token: string) => api.post<Entry>(`${entry(slug, token)}/cancel`)
export const notifyOnTheWay = (slug: string, token: string) => api.post<Entry>(`${entry(slug, token)}/on-the-way`)
export const entryStreamPath = (slug: string, token: string) => `${entry(slug, token)}/stream`

/* Anfitrión */
export const getHostQueue = (slug: string) => api.get<HostQueue>(`${base(slug)}/host/queue`, { auth: true })
export const runHostAction = (slug: string, entryId: number, action: HostAction) =>
  api.post<HostQueue>(`${base(slug)}/host/entries/${entryId}/${action}`, undefined, { auth: true })
export const hostStreamPath = (slug: string) => `${base(slug)}/host/stream`
