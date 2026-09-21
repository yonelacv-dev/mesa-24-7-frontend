import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Notice } from '@/shared/components/Notice'
import { messageFor } from '@/shared/constants/errors'
import type { ErrorInfo, JoinValues } from '@/shared/types'
import { joinSchema, type JoinFormValues } from '../../schemas/join.schema'
import { PartyStepper } from './PartyStepper'

const FIELD_ERRORS = ['name', 'phone', 'party_size'] as const
type FieldName = (typeof FIELD_ERRORS)[number]
const isFieldName = (value: string | null | undefined): value is FieldName =>
  FIELD_ERRORS.includes(value as FieldName)

interface JoinFormProps {
  phonePrefix: string
  onSubmit: (values: JoinValues) => void
  pending: boolean
  serverError: ErrorInfo | null
  disabled?: boolean
}

/** Pantalla 1: el formulario para unirse. Recibe el error del back y lo pone bajo el campo que corresponda. */
export function JoinForm({ phonePrefix, onSubmit, pending, serverError, disabled }: JoinFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<JoinFormValues>({ resolver: zodResolver(joinSchema), defaultValues: { name: '', phone: '', party_size: 2 } })

  const fieldError = serverError && isFieldName(serverError.field) ? serverError : null
  useEffect(() => {
    if (fieldError && isFieldName(fieldError.field)) setError(fieldError.field, { message: messageFor(fieldError) })
  }, [fieldError, setError])

  const generalError = serverError && !fieldError ? messageFor(serverError) : null
  const partySize = useWatch({ control, name: 'party_size' })
  const busy = disabled || pending

  return (
    <Card className="shadow-[0_16px_36px_-18px_rgba(24,24,24,0.45)]">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              autoComplete="given-name"
              maxLength={60}
              placeholder="Carla"
              disabled={disabled}
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && <p role="alert" className="text-sm font-semibold text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-input bg-muted px-3.5 text-sm font-bold text-muted-foreground">
                {phonePrefix}
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="987 654 321"
                className="rounded-l-none"
                disabled={disabled}
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
            </div>
            {errors.phone && <p role="alert" className="text-sm font-semibold text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label>¿Cuántos son?</Label>
            <PartyStepper
              value={partySize}
              disabled={disabled}
              onChange={(value) => setValue('party_size', value, { shouldValidate: true })}
            />
            {errors.party_size && (
              <p role="alert" className="text-sm font-semibold text-destructive">{errors.party_size.message}</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Al unirte aceptas que el anfitrión te llame a este número cuando tu mesa esté lista.
          </p>
          {generalError && <Notice tone="destructive">{generalError}</Notice>}
          <Button type="submit" size="lg" disabled={busy} className="shadow-[0_10px_22px_-10px_hsl(var(--primary)/0.85)]">
            {pending ? 'Uniéndote…' : 'Unirme a la cola'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
