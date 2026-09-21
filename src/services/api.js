/**
 * Cliente HTTP global. Habla con el back en /api/v1 y traduce sus errores a ApiError.
 * No conoce React ni los módulos: quien lo necesita le registra cómo obtener el token (configureApi).
 */
const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`

export class ApiError extends Error {
  constructor({ status, code, message, field = null, retryAfter = null }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code // estable: el front elige el texto según el código
    this.field = field
    this.retryAfter = retryAfter
  }

  get isNetwork() {
    return this.status === 0
  }
}

let getToken = () => null
let onUnauthorized = () => {}

export function configureApi(options) {
  getToken = options.getToken ?? getToken
  onUnauthorized = options.onUnauthorized ?? onUnauthorized
}

export function apiUrl(path) {
  return `${BASE_URL}${path}`
}

export function authHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function toApiError(response) {
  let body = null
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

/**
 * @param {string} path  ruta bajo /api/v1
 * @param {{method?: string, body?: unknown, auth?: boolean, signal?: AbortSignal}} [options]
 *   auth: true envía el token del anfitrión (y avisa si el back lo rechaza).
 */
export async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  let response
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
    if (cause?.name === 'AbortError') throw cause
    throw new ApiError({ status: 0, code: 'network_error', message: 'Sin conexión con el servidor.' })
  }

  if (response.status === 204) return null
  if (!response.ok) {
    const error = await toApiError(response)
    if (auth && error.status === 401) onUnauthorized(error)
    throw error
  }
  return response.json()
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
}
