import { plural } from '@/shared/utils/plural'

/** "Eres el siguiente." / "Hay 3 grupos delante de ti." */
export function positionText(position) {
  if (position <= 1) return 'Eres el siguiente.'
  const ahead = position - 1
  return `Hay ${ahead} ${plural(ahead, 'grupo', 'grupos')} delante de ti.`
}

/** { min: 10, max: 15 } -> "10 a 15 min" */
export function etaText(eta) {
  return `${eta.min} a ${eta.max} min`
}

export function partyText(count) {
  return `${count} ${plural(count, 'persona', 'personas')}`
}
