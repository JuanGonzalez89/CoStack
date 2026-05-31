"use client"

import { useState } from "react"
import { KeyRound, ShieldCheck, CheckCircle2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SeatAccessCardData } from "@/features/dashboard/contracts"
import { cn } from "@/lib/utils"

const stateStyles = {
  current: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  overdue: "bg-amber-400/10 text-amber-100 border-amber-400/20",
  blocked: "bg-red-400/10 text-red-100 border-red-400/20",
}

export function SuccessAccessCard({ accessState, groupName, accessToken }: SeatAccessCardData) {
  const [showCredentials, setShowCredentials] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(accessToken)
    alert("Credenciales copiadas al portapapeles")
  }

  return (
    <section className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 p-8 shadow-lg overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-3xl font-extrabold text-zinc-50 tracking-tight mb-2">Tu acceso está listo</h3>
        <p className="text-slate-300 max-w-md mx-auto mb-8">
          Ya sos parte de <strong className="text-cyan-300">{groupName}</strong>. Tenés acceso listo para usar tu herramienta.
        </p>

        {!showCredentials ? (
          <Button 
            onClick={() => setShowCredentials(true)}
            size="lg"
            className="w-full sm:w-auto rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 font-bold text-lg h-14 px-8 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
          >
            Ver Credenciales de Acceso
          </Button>
        ) : (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                <KeyRound size={14} />
                Credencial de acceso
              </div>
              <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", stateStyles[accessState])}>
                <ShieldCheck size={12} />
                Activo
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 bg-black/50 border border-white/5 rounded-xl p-4">
              <code className="font-mono text-lg text-zinc-50">{accessToken}</code>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopy}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              No compartas esta credencial. Es personal para tu usuario.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
