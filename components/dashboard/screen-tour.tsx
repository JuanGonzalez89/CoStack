"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, CreditCard, Wallet, Settings, ArrowRight, X, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const screens = [
  { icon: LayoutDashboard, title: "Dashboard", desc: "Acá ves tus licencias activas y el progreso de las salas de espera." },
  { icon: CreditCard, title: "Suscripciones", desc: "Catálogo de todas las herramientas. Elegí una, pagá y entrá a la sala." },
  { icon: Wallet, title: "Billetera", desc: "Historial de pagos, cuánto gastaste y tus movimientos." },
  { icon: Settings, title: "Ajustes", desc: "Perfil, suscripciones activas y fechas de renovación." },
]

const positions = [
  { top: "148px" },
  { top: "195px" },
  { top: "243px" },
  { top: "312px" },
]

interface ScreenTourProps {
  open: boolean
  onComplete: () => void
  onClose: () => void
}

export function ScreenTour({ open, onComplete, onClose }: ScreenTourProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      setStep(0)
    }
  }, [open])

  const next = () => {
    if (step < screens.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  if (!open) return null

  const screen = screens[step]
  const pos = positions[step]

  return (
    <>
      {visible && <div className="fixed inset-0 z-50" onClick={onClose} />}

      <div
        className={cn(
          "fixed z-50 transition-all duration-300",
          visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none",
        )}
        style={{ top: pos.top, left: "268px" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative bg-zinc-900 border-2 border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-cyan-500/10 w-64">
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
            <div className="border-8 border-transparent border-r-zinc-900" />
          </div>

          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />

          <div className="flex items-start gap-3 mt-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <screen.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                {step + 1} / {screens.length}
              </p>
              <h4 className="text-sm font-bold text-white mt-0.5">{screen.title}</h4>
            </div>
            <button onClick={onClose} className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 shrink-0">
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 mt-2 leading-relaxed ml-[48px]">
            {screen.desc}
          </p>

          <div className="flex items-center justify-between mt-3 ml-[48px]">
            <div className="flex gap-1">
              {screens.map((_, i) => (
                <span key={i} className={cn("h-1 rounded-full transition-all", i === step ? "w-4 bg-cyan-400" : "w-1 bg-zinc-700")} />
              ))}
            </div>
            <button onClick={next} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              {step < screens.length - 1 ? "Siguiente" : "Comenzar"}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
