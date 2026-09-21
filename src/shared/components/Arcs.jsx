import { cn } from '@/lib/utils'

/** Motivo del logo mesa 24/7: arcos anidados, la "señal". `pulse` los enciende de fuera hacia dentro. */
export function Arcs({ className, pulse = false }) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="none"
      strokeWidth="6"
      className={cn(pulse && 'arc-pulse', className)}
      aria-hidden="true"
    >
      <path className="arc" style={{ '--i': 0 }} stroke="#F03808" d="M3 56V22A19 19 0 0 1 22 3H41A19 19 0 0 1 60 22V56" />
      <path className="arc" style={{ '--i': 1 }} stroke="#F08800" d="M15 56V26A11 11 0 0 1 26 15H37A11 11 0 0 1 48 26V56" />
      <path className="arc" style={{ '--i': 2 }} stroke="#E8C800" strokeWidth="14" strokeLinecap="round" d="M32 62V34" />
    </svg>
  )
}
