import { api } from '@/services/api'

const base = (slug) => `/venues/${encodeURIComponent(slug)}`

export const getVenueStatus = (slug) => api.get(`${base(slug)}/diner/status`)

export const pauseVenue = (slug) => api.post(`${base(slug)}/host/pause`, undefined, { auth: true })
export const resumeVenue = (slug) => api.post(`${base(slug)}/host/resume`, undefined, { auth: true })
export const saveSchedule = (slug, body) => api.put(`${base(slug)}/host/schedule`, body, { auth: true })
