import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema } from '../schemas/login.schema'
import { Notice } from '@/shared/components/Notice'

export function LoginForm({ onSubmit, pending, errorMessage }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { username: '', password: '' } })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          aria-invalid={!!errors.username}
          {...register('username')}
        />
        {errors.username && <p role="alert" className="text-sm font-semibold text-destructive">{errors.username.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && <p role="alert" className="text-sm font-semibold text-destructive">{errors.password.message}</p>}
      </div>
      {errorMessage && <Notice tone="destructive">{errorMessage}</Notice>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
