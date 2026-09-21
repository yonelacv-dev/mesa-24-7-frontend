import { formatCountdown, serverNow } from '@/shared/utils/time'

/** Milisegundos que le quedan al plazo, medidos con el reloj del servidor. Negativo si ya venció. */
export function holdRemainingMs(holdEndsAt: string, offsetMs: number, nowMs: number): number {
  return Date.parse(holdEndsAt) - serverNow(offsetMs, nowMs)
}

export function holdCountdown(holdEndsAt: string, offsetMs: number, nowMs: number): { expired: boolean; text: string } {
  const remaining = holdRemainingMs(holdEndsAt, offsetMs, nowMs)
  return { expired: remaining <= 0, text: formatCountdown(remaining) }
}
