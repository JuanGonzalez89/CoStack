"use client"

import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">Pérdida de conexión</p>
        <h1 className="text-2xl font-bold text-zinc-50">Tuvimos un problema cargando esta vista.</h1>
        <p className="text-sm text-zinc-400">Es posible que la red haya fallado o el recurso no esté disponible. Dale clic abajo para intentar conectar de nuevo sin perder tu sesión.</p>
        <button onClick={reset} className="rounded-xl bg-sky-500 hover:bg-sky-400 transition-colors px-6 py-3 mt-4 text-sm font-semibold text-white shadow-md">
          Volver a conectar
        </button>
      </div>
    </div>
  )
}