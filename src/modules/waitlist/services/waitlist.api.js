import { api } from '@/services/api'

const base = (slug) => `/venues/${encodeURIComponent(slug)}`
const entry = (slug, token) => `${base(slug)}/diner/entries/${encodeURIComponent(token)}`

/* Comensal */
export const joinQueue = (slug, body) => api.post(`${base(slug)}/diner/join`, body)
export const lookupTicket = (slug, body) => api.post(`${base(slug)}/diner/tickets/lookup`, body)
export const getEntry = (slug, token) => api.get(entry(slug, token))
export const cancelEntry = (slug, token) => api.post(`${entry(slug, token)}/cancel`)
export const notifyOnTheWay = (slug, token) => api.post(`${entry(slug, token)}/on-the-way`)
export const entryStreamPath = (slug, token) => `${entry(slug, token)}/stream`

/* Anfitrión */
export const getHostQueue = (slug) => api.get(`${base(slug)}/host/queue`, { auth: true })
export const runHostAction = (slug, entryId, action) =>
  api.post(`${base(slug)}/host/entries/${entryId}/${action}`, undefined, { auth: true })
export const hostStreamPath = (slug) => `${base(slug)}/host/stream`
