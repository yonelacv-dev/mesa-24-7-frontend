/**
 * Tipos del dominio, derivados de los que se generan desde el OpenAPI del back (api.generated.ts).
 * El back declara `status` y `kind` como `str`; aquí se acotan a las uniones reales.
 * Regenerar con `npm run gen:api` (con el back corriendo) cuando cambie la API.
 */
import type { components } from './api.generated'

type Schemas = components['schemas']

export type EntryStatus = 'waiting' | 'called' | 'seated' | 'cancelled' | 'no_show' | 'removed'
export type ListKind = 'open' | 'paused' | 'closed'
export type HostAction = 'call' | 'seat' | 'no-show' | 'remove'
export type ConnectionStatus = 'connecting' | 'live' | 'offline' | 'failed'

export type NextOpen = Schemas['NextOpenOut']
export type ListStatus = Omit<Schemas['ListStatusOut'], 'kind'> & { kind: ListKind }
export type Venue = Schemas['VenueOut']
export type VenueStatus = Omit<Schemas['VenueStatusOut'], 'status'> & { status: ListStatus }

/** Un día del horario: el cuerpo de PUT /host/schedule y el borrador del formulario. */
export type DayDraft = Schemas['DayWindowIn']
export type ScheduleBody = Schemas['ScheduleIn']
export type DayWindow = Schemas['DayWindowOut']
export type HostVenue = Omit<Schemas['HostVenueOut'], 'list_status'> & { list_status: ListStatus }

/** El turno del comensal (lo que ve de su propia entrada). */
export type Entry = Omit<Schemas['EntryOut'], 'status'> & { status: EntryStatus }
export type JoinedEntry = Omit<Schemas['JoinOut'], 'status'> & { status: EntryStatus }
export type JoinValues = Pick<Schemas['JoinIn'], 'name' | 'phone' | 'party_size'>
export type LookupValues = { ticket: string; phone: string }

/** La cola del anfitrión: solo esperando y llamados. */
export type HostRow = Omit<Schemas['HostRowOut'], 'status'> & { status: 'waiting' | 'called' }
export type HostQueue = Omit<Schemas['HostQueueOut'], 'venue' | 'rows'> & { venue: HostVenue; rows: HostRow[] }

export type Credentials = Schemas['LoginIn']
export type LoginResult = Schemas['LoginOut']
export type SessionUser = Schemas['SessionUserOut']
export type Session = { token: string; user: SessionUser }

/** Mensajes de los streams en vivo (SSE). */
/** Aviso sobre una entrada (unirse, llamar...). Lleva los datos del comensal. */
export type EntryFeed = {
  kind: 'joined' | 'called' | 'seated' | 'no_show' | 'cancelled' | 'removed' | 'on_the_way'
  entry_id: number
  ticket: number
  name: string
  party_size: number
  phone_e164: string
  phone_display: string
}
/** Aviso sobre el local (pausa, horario): no lleva datos de comensal. */
export type VenueFeed = { kind: 'paused' | 'resumed' | 'schedule_updated' }
export type FeedMessage = EntryFeed | VenueFeed
export type DinerStreamMessage = { event: 'state'; data: Entry }
export type HostStreamMessage = { event: 'queue'; data: HostQueue } | { event: 'feed'; data: FeedMessage }

/** Forma mínima de un error para mostrarlo (ApiError la cumple). */
export type ErrorInfo = { code: string; field?: string | null; retryAfter?: number | null }
