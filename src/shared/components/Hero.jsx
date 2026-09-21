import { Arcs } from '@/shared/components/Arcs'

/** Bloque oscuro superior de las pantallas del comensal. */
export function Hero({ children }) {
  return (
    <div className="relative overflow-hidden rounded-b-[2rem] bg-ink px-5 pt-6 pb-14 text-ink-foreground">
      <Arcs className="pointer-events-none absolute right-4 -bottom-px hidden h-20 w-[92px] min-[400px]:block" />
      <div className="relative">{children}</div>
    </div>
  )
}
