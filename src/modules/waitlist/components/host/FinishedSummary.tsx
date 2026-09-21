import { Badge } from '@/components/ui/badge'

/** "Terminados hoy": sentados, salieron (cancelaron o fueron sacados) y no vinieron. */
export function FinishedSummary({ seated, left, noShow }: { seated: number; left: number; noShow: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
      <span>Terminados hoy</span>
      <Badge className="border-transparent bg-success-soft px-3 py-1 text-xs font-bold text-success">
        {seated} sentados
      </Badge>
      <Badge className="border-transparent bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
        {left} salieron
      </Badge>
      <Badge className="border-transparent bg-warning-soft px-3 py-1 text-xs font-bold text-warning">
        {noShow} no vinieron
      </Badge>
    </div>
  )
}
