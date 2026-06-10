"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, CreditCard, Wallet, Settings, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

const screens = [
  { id: "dashboard", icon: LayoutDashboard, title: "Dashboard", desc: "Tus licencias activas y salas de espera.", accent: "from-cyan-500 to-sky-500" },
  { id: "suscripciones", icon: CreditCard, title: "Suscripciones", desc: "Catálogo con todas las herramientas disponibles para comprar.", accent: "from-emerald-500 to-green-500" },
  { id: "billetera", icon: Wallet, title: "Billetera", desc: "Tus pagos, historial y movimientos.", accent: "from-violet-500 to-purple-500" },
  { id: "ajustes", icon: Settings, title: "Ajustes", desc: "Perfil, suscripciones activas y fechas de renovación.", accent: "from-amber-500 to-orange-500" },
]

const positions = [
  { top: "132px" },
  { top: "176px" },
  { top: "220px" },
  { bottom: "72px" },
]

interface OnboardingTourProps {
  onComplete?: () => void
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem("costack_tour_seen")
    if (!seen) {
      const timer = setTimeout(() => {
        setVisible(true)
        setDismissed(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const finish = () => {
    localStorage.setItem("costack_tour_seen", "true")
    setVisible(false)
    setDismissed(true)
    onComplete?.()
  }

  const next = () => {
    if (step < screens.length - 1) {
      setStep(step + 1)
    } else {
      finish()
    }
  }

  if (dismissed) return null

  const screen = screens[step]
  const pos = positions[step]

  return (
    <>
      {visible && (
        <div
          className="fixed inset-0 z-40"
          onClick={finish}
        />
      )}

      <div
        className={cn(
          "fixed z-50 transition-all duration-300",
          visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none",
        )}
        style={{ top: pos.top, bottom: pos.bottom, left: "256px" }}
      >
        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-2 border-cyan-500/30 rounded-2xl p-4 shadow-2xl shadow-cyan-500/5 w-64 ml-3">
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
            <div className="border-8 border-transparent border-r-zinc-900" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 border-[7px] border-transparent border-r-cyan-500/30" style={{ transform: 'translate(-1px, -50%)' }} />
          </div>

          <div className={cn(
            "absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r", screen.accent
          )} />

          <div className="flex items-start gap-3 mt-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              "bg-white/5 text-white"
            )}>
              <screen.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                {step + 1} / {screens.length}
              </p>
              <h4 className="text-sm font-bold text-white mt-0.5">{screen.title}</h4>
            </div>
            <button
              onClick={finish}
              className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 mt-2 leading-relaxed ml-[48px]">
            {screen.desc}
          </p>

          <div className="flex items-center justify-between mt-3 ml-[48px]">
            <div className="flex gap-1">
              {screens.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === step ? "w-4 bg-gradient-to-r from-cyan-400 to-sky-400" : "w-1 bg-zinc-700",
                  )}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              {step < screens.length - 1 ? "Siguiente" : "Comenzar"}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
