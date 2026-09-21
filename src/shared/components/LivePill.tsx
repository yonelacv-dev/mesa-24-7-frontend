import { cn } from '@/lib/utils'
import type { ConnectionStatus } from '@/shared/types'

const LABELS: Record<ConnectionStatus, string> = {
  live: 'En vivo',
  connecting: 'Conectando…',
  offline: 'Sin conexión, reintentando',
  failed: 'Sin conexión, reintentando',
}

/** Indicador de conexión en tiempo real. */
export function LivePill({ status }: { status: ConnectionStatus }) {
  const offline = status === 'offline' || status === 'failed'
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-bold text-muted-foreground"
    >
      <span
        className={cn(
          'size-2 rounded-full',
          offline ? 'bg-brand-orange' : status === 'live' ? 'animate-live bg-success' : 'bg-muted-foreground',
        )}
      />
      {LABELS[status]}
    </span>
  )
}
