import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Escribe tu usuario.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
