"use client"

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-lg space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Error global</p>
        <h1 className="text-2xl font-bold">La aplicación encontró un problema.</h1>
        <p className="text-sm text-muted-foreground">Podés reintentar la acción para volver a cargar la ruta actual.</p>
        <button onClick={reset} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Reintentar
        </button>
      </div>
    </div>
  )
}