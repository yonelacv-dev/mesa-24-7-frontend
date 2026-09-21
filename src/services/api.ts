/**
 * Cliente HTTP global. Habla con el back en /api/v1 y traduce sus errores a ApiError.
 * No conoce React ni los módulos: quien lo necesita le registra cómo obtener el token (configureApi).
 */
const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`

interface ApiErrorInit {
  status: number
  code: string
  message: string
  field?: string | null
  retryAfter?: number | null
}

export class ApiError extends Error {
  status: number
  code: string // estable: el front elige el texto según el código
  field: string | null
  retryAfter: number | null

  constructor({ status, code, message, field = null, retryAfter = null }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.field = field
    this.retryAfter = retryAfter
  }

  get isNetwork(): boolean {
    return this.status === 0
  }
}

interface ApiConfig {
  getToken?: () => string | null
  onUnauthorized?: (error: ApiError) => void
}

let getToken: () => string | null = () => null
let onUnauthorized: (error: ApiError) => void = () => {}

export function configureApi(options: ApiConfig): void {
  getToken = options.getToken ?? getToken
  onUnauthorized = options.onUnauthorized ?? onUnauthorized
}

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`
}

export function authHeader(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: { error?: { code?: string; message?: string; field?: string | null } } | null = null
  try {
    body = await response.json()
  } catch {
    // el cuerpo no era JSON (error de un proxy, por ejemplo)
  }
  const error = body?.error
  return new ApiError({
    status: response.status,
    code: error?.code ?? 'unexpected_error',
    message: error?.message ?? 'Ocurrió un error inesperado.',
    field: error?.field ?? null,
    retryAfter: Number(response.headers.get('Retry-After')) || null,
  })
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  /** true envía el token del anfitrión (y avisa si el back lo rechaza). */
  auth?: boolean
  signal?: AbortSignal
}

/** @param path ruta bajo /api/v1 */
export async function request<T>(
  path: string,
  { method = 'GET', body, auth = false, signal }: RequestOptions = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? authHeader() : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError({ status: 0, code: 'network_error', message: 'Sin conexión con el servidor.' })
  }

  if (response.status === 204) return null as T
  if (!response.ok) {
    const error = await toApiError(response)
    if (auth && error.status === 401) onUnauthorized(error)
    throw error
  }
  return (await response.json()) as T
}

type CallOptions = Omit<RequestOptions, 'method' | 'body'>

export const api = {
  get: <T>(path: string, options?: CallOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: CallOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: CallOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
}
