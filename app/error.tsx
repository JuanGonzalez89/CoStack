"use client"

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111d] px-4 text-slate-100">
      <div className="max-w-lg space-y-4 rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">Interrupción Inesperada</p>
        <h1 className="text-2xl font-bold">Algo no salió como esperábamos.</h1>
        <p className="text-sm text-slate-400">Hubo un fallo en la comunicación o una ruta inválida. Puedes recargar la página para limpiar el estado y continuar navegando.</p>
        <button onClick={reset} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 transition-colors px-6 py-3 mt-4 text-sm font-semibold text-white shadow-md">
          Recargar y continuar
        </button>
      </div>
    </div>
  )
}