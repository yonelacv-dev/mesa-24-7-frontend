import { cn } from '@/lib/utils'

const TONES = {
  default: 'bg-accent text-accent-foreground',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  destructive: 'bg-destructive/10 text-destructive',
}

/** Aviso corto en línea. */
export function Notice({ tone = 'default', className, children, ...props }) {
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
