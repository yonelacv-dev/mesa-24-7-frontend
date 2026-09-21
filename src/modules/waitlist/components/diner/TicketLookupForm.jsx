import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { lookupSchema } from '../../schemas/lookup.schema'

/** "¿Ya tienes ticket?": recupera el turno con el número de ticket y el teléfono. */
export function TicketLookupForm({ onSubmit, pending, errorMessage, disabled }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(lookupSchema), defaultValues: { ticket: '', phone: '' } })

  const message = errorMessage ?? errors.ticket?.message ?? errors.phone?.message

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Buscar ticket" className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-extrabold">¿Ya tienes ticket?</h2>
            <p className="text-sm text-muted-foreground">Busca tu turno con el número de ticket y tu teléfono.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex w-28 shrink-0 flex-col gap-2">
              <Label htmlFor="lookup-ticket">Ticket</Label>
              <Input
                id="lookup-ticket"
                inputMode="numeric"
                placeholder="14"
                maxLength={7}
                disabled={disabled}
                aria-invalid={!!errors.ticket}
                {...register('ticket')}
              />
            </div>
            <div className="flex min-w-40 flex-1 flex-col gap-2">
              <Label htmlFor="lookup-phone">Teléfono</Label>
              <Input
                id="lookup-phone"
                type="tel"
                inputMode="tel"
                placeholder="987 654 321"
                disabled={disabled}
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
            </div>
          </div>
          {message && <p role="alert" className="text-sm font-semibold text-destructive">{message}</p>}
          <Button type="submit" variant="outline" disabled={disabled || pending}>
            <Search />
            Buscar mi ticket
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
