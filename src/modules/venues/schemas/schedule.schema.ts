import { z } from 'zod'

import type { DayDraft } from '@/shared/types'
import { dayError } from '../domain/schedule'

const day = z.object({
  is_open: z.boolean(),
  start: z.string(),
  end: z.string(),
})

/** Los 7 días; cada error apunta al día que lo causó (path[0]) y lleva el código del back como mensaje. */
export const scheduleSchema = z
  .array(day)
  .length(7)
  .superRefine((days, ctx) => {
    days.forEach((d, index) => {
      const code = dayError(d)
      if (code) ctx.addIssue({ code: 'custom', message: code, path: [index] })
    })
  })

/** { [índiceDelDía]: códigoDeError } */
export function scheduleErrors(days: DayDraft[]): Record<number, string> {
  const result = scheduleSchema.safeParse(days)
  if (result.success) return {}
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]))
}
