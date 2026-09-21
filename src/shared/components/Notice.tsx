import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'default' | 'warning' | 'success' | 'destructive'

const TONES: Record<Tone, string> = {
  default: 'bg-accent text-accent-foreground',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  destructive: 'bg-destructive/10 text-destructive',
}

/** Aviso corto en línea. */
interface NoticeProps extends ComponentProps<'div'> {
  tone?: Tone
}

export function Notice({ tone = 'default', className, children, ...props }: NoticeProps) {
  return (
    <div
      role={tone === 'destructive' ? 'alert' : 'status'}
      className={cn('rounded-2xl px-4 py-3 text-sm font-semibold', TONES[tone], className)}
      {...props}
    >
      {children}
    </div>
  )
}
