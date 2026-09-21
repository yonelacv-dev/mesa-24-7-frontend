import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { plural } from '@/shared/utils/plural'

const MIN = 1
const MAX = 20

/** "¿Cuántos son?" con control menos y más. */
export function PartyStepper({ value, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted p-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        aria-label="Una persona menos"
        disabled={disabled || value <= MIN}
        onClick={() => onChange(Math.max(MIN, value - 1))}
      >
        <Minus />
      </Button>
      <div className="text-center" aria-live="polite">
        <span className="text-4xl font-extrabold tabular-nums">{value}</span>
        <span className="ml-2 text-sm font-semibold text-muted-foreground">
          {plural(value, 'persona', 'personas')}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        aria-label="Una persona más"
        disabled={disabled || value >= MAX}
        onClick={() => onChange(Math.min(MAX, value + 1))}
      >
        <Plus />
      </Button>
    </div>
  )
}
