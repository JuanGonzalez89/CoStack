import type { ReactNode } from 'react'
import Link from 'next/link'

export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-8">
        <aside className="space-y-6 rounded-[28px] border border-zinc-800/80 bg-zinc-900/85 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300">
              CoStack
            </div>
            <div className="space-y-3">
              <h1 className="max-w-lg text-4xl font-bold tracking-tight text-balance text-zinc-50">
                Paga menos por tus herramientas y activa tu acceso sin complicarte.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-zinc-400">
                Inicia sesion, elige la opcion que mas te conviene y sigue un flujo simple hasta tener tu licencia lista.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FeatureCard title="Ahorro" description="Compara precios y cupos en segundos." />
            <FeatureCard title="Pago claro" description="Reserva y confirma sin pasos confusos." />
            <FeatureCard title="Acceso rapido" description="Terminas con estado y proximo paso claros." />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-2">
            <p className="text-xs text-zinc-500">Disenado para que entiendas que hacer en cada paso.</p>
            <Link href="/" className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
              Volver al marketing
            </Link>
          </div>
        </aside>

        <div className="flex items-center justify-center lg:justify-end">{children}</div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-sm font-semibold text-zinc-50">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
    </div>
  )
}