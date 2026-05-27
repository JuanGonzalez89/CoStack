"use client"

import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">Error</p>
        <h1 className="text-2xl font-bold text-zinc-50">No se pudo cargar esta sección.</h1>
        <p className="text-sm text-zinc-400">Reintentá la navegación para volver a montar el dashboard.</p>
        <button onClick={reset} className="rounded-xl bg-sky-500 hover:bg-sky-400 transition-colors px-4 py-2 mt-4 text-sm font-semibold text-white">
          Reintentar
        </button>
      </div>
    </div>
  )
}