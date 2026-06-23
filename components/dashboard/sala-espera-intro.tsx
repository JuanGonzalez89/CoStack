"use client"

import { Clock, Users, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ToolCardData } from "@/features/dashboard/contracts"

interface SalaEsperaIntroProps {
  tool: ToolCardData
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export function SalaEsperaIntro({ tool, open, onConfirm, onClose }: SalaEsperaIntroProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-white/10 text-white max-w-xl w-full rounded-3xl p-7 space-y-5 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-amber-400 font-semibold">{tool?.provider}</p>
            <h3 className="text-lg font-bold text-white">{tool?.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
          >
            <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
          <p className="text-sm text-zinc-300 leading-relaxed">
            La licencia de <strong className="text-white">{tool?.name}</strong> se activa cuando se completan los <strong className="text-white">{tool?.lobbyTotal ?? "X"} cupos</strong>. Mientras tanto, pagás y esperás en la sala con progreso en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-white font-medium block mb-0.5">Pago protegido</span>
              Si no se completan los {tool?.lobbyTotal ?? "X"} cupos en 24hs, devolución <strong className="text-white">100%</strong>.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <Users className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-white font-medium block mb-0.5">Anónimo</span>
              Ves "Miembro 1", "Miembro 2". Sin nombres ni emails.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-white font-medium block mb-0.5">24 horas</span>
              Tiempo máximo para completar los cupos.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-white font-medium block mb-0.5">Al instante</span>
              Al completar, llega la licencia automáticamente.
            </p>
          </div>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full rounded-xl bg-white hover:bg-zinc-200 text-black font-bold h-11"
        >
          Entrar a la sala de espera
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
