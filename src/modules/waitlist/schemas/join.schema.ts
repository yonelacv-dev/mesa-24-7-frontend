import { z } from 'zod'

import { ERROR_MESSAGES } from '@/shared/constants/errors'

const digits = (value: string) => value.replace(/\D/g, '')

/**
 * Validación de comodidad: avisa antes de enviar. El back es quien decide (país, largo real del celular)
 * y sus errores se muestran con el mismo texto.
 */
export const joinSchema = z.object({
  name: z.string().trim().min(1, ERROR_MESSAGES.name_required).max(60, ERROR_MESSAGES.name_too_long),
  phone: z.string().refine((value) => digits(value).length >= 6, ERROR_MESSAGES.invalid_phone),
  party_size: z.number().int().min(1).max(20),
})

export type JoinFormValues = z.infer<typeof joinSchema>
