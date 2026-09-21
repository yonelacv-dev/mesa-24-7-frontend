import { Arcs } from '@/shared/components/Arcs'

/** Pantalla completa para cargando, no encontrado y errores que no permiten seguir. */
export function PageState({ title, text, action }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-background px-6 py-10 text-center">
      <Arcs pulse className="h-14 w-16" />
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
      {action}
    </main>
  )
}
