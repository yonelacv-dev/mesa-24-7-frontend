/** Un día del horario en el formulario: { is_open, start: 'HH:MM', end: 'HH:MM' }. */

/** Si el cierre es menor o igual al inicio, la ventana cruza la medianoche. */
export function crossesMidnight(day) {
  return Boolean(day.is_open && day.start && day.end && day.start !== day.end && day.end <= day.start)
}

/** Código del error de un día, o null si está bien. Los mismos códigos que devuelve el back. */
export function dayError(day) {
  if (!day.is_open) return null
  if (!day.start || !day.end) return 'time_required'
  if (day.start === day.end) return 'schedule_start_equals_end'
  return null
}

export function scheduleIsValid(days) {
  return days.every((day) => dayError(day) === null)
}

/** Del horario que trae la cola al borrador que edita el formulario. */
export function toDraft(schedule) {
  return schedule.map(({ is_open, start, end }) => ({ is_open, start, end }))
}

/** Del borrador al cuerpo de PUT /host/schedule. */
export function toRequestBody(days) {
  return { days: days.map(({ is_open, start, end }) => ({ is_open, start, end })) }
}
