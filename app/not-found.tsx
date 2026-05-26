import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-lg space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">404</p>
        <h1 className="text-2xl font-bold">No encontramos esta ruta.</h1>
        <p className="text-sm text-muted-foreground">Volvé al inicio o regresá al dashboard para seguir navegando.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Ir al inicio
          </Link>
          <Link href="/overview" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}