import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
      <div className="max-w-lg space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">404</p>
        <h1 className="text-2xl font-bold">No encontramos esta ruta.</h1>
        <p className="text-sm text-zinc-400">Volvé al inicio o regresá al dashboard para seguir navegando.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mt-6">
          <Link href="/" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors">
            Ir al inicio
          </Link>
          <Link href="/overview" className="rounded-xl border border-zinc-700 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}