import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { listStatusBadge } from '../domain/opening'

const TONES = {
  open: 'bg-brand-sun text-[#181818]',
  paused: 'bg-brand-orange text-[#181818]',
  closed: 'bg-white/15 text-white',
}

/** Chip sobre fondo oscuro: "Abierta hasta las 01:00", "En pausa" o "Cerrada". */
export function ListStatusBadge({ status }) {
  const { label, tone } = listStatusBadge(status)
  return <Badge className={cn('border-transparent px-3 py-1 text-xs font-bold', TONES[tone])}>{label}</Badge>
}
