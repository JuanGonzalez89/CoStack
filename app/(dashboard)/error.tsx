"use client"

import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Dashboard error</p>
        <h1 className="text-2xl font-bold text-foreground">No se pudo cargar esta sección.</h1>
        <p className="text-sm text-muted-foreground">Reintentá la navegación para volver a montar el dashboard.</p>
        <button onClick={reset} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Reintentar
        </button>
      </div>
    </div>
  )
}