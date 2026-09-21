/** Texto para cada código de error estable del back. El back manda el código; el front elige la frase. */
export const ERROR_MESSAGES = {
  name_required: 'Escribe tu nombre para que el anfitrión te encuentre.',
  name_too_long: 'El nombre admite hasta 60 caracteres.',
  invalid_phone: 'Ingresa un celular de 9 dígitos, por ejemplo 987 654 321.',
  party_size_out_of_range: 'Pueden ser de 1 a 20 personas. Si son más, habla con el anfitrión.',
  consent_required: 'Debes aceptar que el anfitrión te llame.',
  list_closed: 'La lista de espera está cerrada.',
  list_paused: 'La lista está en pausa. Pregunta al anfitrión en la entrada.',
  ticket_not_found: 'No encontramos un ticket con esos datos. Revisa el número y el teléfono.',
  entry_not_found: 'No encontramos tu turno.',
  venue_not_found: 'No encontramos ese local.',
  invalid_transition: 'Esa acción ya no es posible: la lista cambió. Ya la actualizamos.',
  invalid_credentials: 'Usuario o contraseña incorrectos.',
  invalid_token: 'Tu sesión ya no es válida. Inicia sesión de nuevo.',
  venue_forbidden: 'Esta cuenta no puede operar en este local.',
  schedule_start_equals_end: 'La hora de inicio y la de cierre no pueden ser iguales.',
  rate_limited: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  network_error: 'Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.',
}

const FALLBACK = 'Ocurrió un error inesperado. Inténtalo de nuevo.'

/** @param {{code?: string, retryAfter?: number|null}|null|undefined} error */
export function messageFor(error) {
  if (!error?.code) return FALLBACK
  const message = ERROR_MESSAGES[error.code] ?? FALLBACK
  return error.code === 'rate_limited' && error.retryAfter
    ? `${message} (${error.retryAfter} s)`
    : message
}
