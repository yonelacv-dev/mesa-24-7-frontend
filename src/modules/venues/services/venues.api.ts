import { api } from '@/services/api'
import type { HostVenue, ScheduleBody, VenueStatus } from '@/shared/types'

const base = (slug: string) => `/venues/${encodeURIComponent(slug)}`

export const getVenueStatus = (slug: string) => api.get<VenueStatus>(`${base(slug)}/diner/status`)

export const pauseVenue = (slug: string) => api.post<HostVenue>(`${base(slug)}/host/pause`, undefined, { auth: true })
export const resumeVenue = (slug: string) => api.post<HostVenue>(`${base(slug)}/host/resume`, undefined, { auth: true })
export const saveSchedule = (slug: string, body: ScheduleBody) =>
  api.put<HostVenue>(`${base(slug)}/host/schedule`, body, { auth: true })
