import { Phone, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ACTION_LABELS, hostActions } from '../../domain/entryStatus'
import { isOverdue, rowChips, waitedText } from '../../domain/hostQueue'
import { partyText } from '../../domain/position'

const CHIP_TONES = {
  neutral: 'border-transparent bg-secondary text-secondary-foreground',
  warning: 'border-transparent bg-warning-soft text-warning',
  danger: 'border-transparent bg-destructive/10 text-destructive',
  success: 'border-transparent bg-success-soft text-success',
}

const PRIMARY = { call: true, seat: true }

/**
 * Una fila de la cola. El contenedor (@container) decide el diseño según el ancho que le toca, no el de la
 * pantalla: apilada en un celular, en una sola línea en una tablet horizontal.
 */
export function QueueRow({ row, holdMinutes, offsetMs, now, offline, busy, onAction }) {
  const called = row.status === 'called'
  const overdue = isOverdue(row, offsetMs, now)
  const stripe = overdue ? 'border-l-destructive' : called ? 'border-l-brand-orange' : 'border-l-transparent'

  return (
    <li
      className={cn(
        '@container border-l-4 py-3 pr-4 pl-3',
        stripe,
        called && !overdue && 'bg-brand-orange/[0.07]',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-ink text-lg font-extrabold text-ink-foreground tabular-nums">
          #{row.ticket}
        </div>

        <div className="min-w-0 flex-1 basis-48">
          <p className="truncate text-base font-extrabold">{row.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              {partyText(row.party_size)}
            </span>
            <span className="tabular-nums">{waitedText(row.joined_at, offsetMs, now)}</span>
            <a
              href={`tel:${row.phone_e164}`}
              className="inline-flex items-center gap-1.5 font-bold text-primary underline-offset-4 hover:underline"
            >
              <Phone className="size-4" aria-hidden="true" />
              {row.phone_display}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {rowChips(row, holdMinutes, offsetMs, now).map((chip) => (
            <Badge key={chip.key} className={cn('px-3 py-1 text-xs font-bold', CHIP_TONES[chip.tone])}>
              {chip.label}
            </Badge>
          ))}
        </div>

        <div className="flex w-full gap-2 @lg:w-auto">
          {hostActions(row.status).map((action) => (
            <Button
              key={action}
              variant={PRIMARY[action] ? 'default' : action === 'remove' ? 'ghost' : 'outline'}
              className="flex-1 @lg:flex-none"
              disabled={offline || busy}
              onClick={() => onAction(action, row)}
            >
              {ACTION_LABELS[action]}
            </Button>
          ))}
        </div>
      </div>
    </li>
  )
}
