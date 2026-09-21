/** Diferencia (ms) entre el reloj del servidor y el de este dispositivo, medida al recibir `serverTime`. */
export function clockOffset(serverTime: string, nowMs: number = Date.now()): number {
  const server = Date.parse(serverTime)
  return Number.isNaN(server) ? 0 : server - nowMs
}

/** "Ahora" según el servidor: la cuenta regresiva no depende de que el reloj del celular esté bien. */
export function serverNow(offsetMs: number, nowMs: number = Date.now()): number {
  return nowMs + offsetMs
}

/** 605000 -> "10:05". Nunca negativo. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Minutos enteros transcurridos entre `isoDate` y `nowMs`. */
export function minutesSince(isoDate: string, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - Date.parse(isoDate)) / 60000))
}
