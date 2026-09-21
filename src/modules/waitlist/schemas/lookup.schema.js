import { z } from 'zod'

import { ERROR_MESSAGES } from '@/shared/constants/errors'

export const lookupSchema = z.object({
  ticket: z.string().trim().regex(/^\d{1,7}$/, 'Escribe el número de tu ticket.'),
  phone: z.string().refine((value) => value.replace(/\D/g, '').length >= 6, ERROR_MESSAGES.invalid_phone),
})
