import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { messageFor } from '@/shared/constants/errors'
import { WEEKDAYS } from '@/shared/constants/weekdays'
import { crossesMidnight, toRequestBody } from '../domain/schedule'
import { scheduleErrors } from '../schemas/schedule.schema'

/** Panel "Horario". `days` es el borrador inicial: [{ is_open, start, end }] de lunes a domingo. */
export function ScheduleDialog({ open, onOpenChange, days, timezoneLabel, onSave, pending, errorMessage }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        {/* Se monta al abrir y se desmonta al cerrar: cada apertura parte del horario guardado. */}
        <ScheduleEditor
          initialDays={days}
          timezoneLabel={timezoneLabel}
          pending={pending}
          errorMessage={errorMessage}
          onCancel={() => onOpenChange(false)}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  )
}

function ScheduleEditor({ initialDays, timezoneLabel, pending, errorMessage, onCancel, onSave }) {
  const [draft, setDraft] = useState(initialDays)
  const errors = scheduleErrors(draft)
  const invalid = Object.keys(errors).length > 0
  const setDay = (index, patch) => setDraft((current) => current.map((d, i) => (i === index ? { ...d, ...patch } : d)))

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="text-xl font-extrabold tracking-tight">Horario de la lista de espera</DialogTitle>
        <DialogDescription>
          Define cuándo pueden unirse los comensales. La hora es la del local{timezoneLabel ? ` (${timezoneLabel})` : ''}.
        </DialogDescription>
      </DialogHeader>

      <ul className="flex flex-col divide-y rounded-2xl border">
        {draft.map((day, index) => (
          <li key={WEEKDAYS[index]} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
            <Switch
              checked={day.is_open}
              onCheckedChange={(value) => setDay(index, { is_open: value })}
              aria-label={`Lista abierta el ${WEEKDAYS[index].toLowerCase()}`}
            />
            <span className="w-24 text-sm font-bold">{WEEKDAYS[index]}</span>
            {day.is_open ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  aria-label={`Inicio del ${WEEKDAYS[index].toLowerCase()}`}
                  className="h-10 w-28"
                  value={day.start}
                  onChange={(event) => setDay(index, { start: event.target.value })}
                />
                <span className="text-sm text-muted-foreground">a</span>
                <Input
                  type="time"
                  aria-label={`Cierre del ${WEEKDAYS[index].toLowerCase()}`}
                  className="h-10 w-28"
                  value={day.end}
                  onChange={(event) => setDay(index, { end: event.target.value })}
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Sin lista de espera</span>
            )}
            {crossesMidnight(day) && <p className="basis-full text-xs text-muted-foreground">Cierra al día siguiente.</p>}
            {errors[index] && (
              <p role="alert" className="basis-full text-xs font-semibold text-destructive">
                {errors[index] === 'time_required'
                  ? 'Indica la hora de inicio y la de cierre.'
                  : messageFor({ code: errors[index] })}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Al llegar la hora de cierre solo se dejan de aceptar comensales nuevos. Los que ya están en la lista se siguen
        atendiendo.
      </p>
      {errorMessage && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {errorMessage}
        </p>
      )}
      <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={invalid || pending} onClick={() => onSave(toRequestBody(draft))}>
          Guardar horario
        </Button>
      </DialogFooter>
    </>
  )
}
