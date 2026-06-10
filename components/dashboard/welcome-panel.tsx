"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Users, Clock, Gem, ShieldCheck, X, ArrowRight, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WelcomePanelProps {
  isOrganizer: boolean
  open: boolean
  onClose: () => void
}

export function WelcomePanel({ isOrganizer, open, onClose }: WelcomePanelProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 200)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [open])

  const dismiss = () => {
    localStorage.setItem("costack_welcome_panel", "true")
    onClose()
  }

  if (!open || !visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl max-w-xl w-full mx-4 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center",
              isOrganizer ? "bg-cyan-500/10 text-cyan-400" : "bg-emerald-500/10 text-emerald-400",
            )}>
              {isOrganizer ? <Gem className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Bienvenido a CoStack</p>
              <h2 className="text-lg font-bold text-white">
                {isOrganizer ? "Como organizador" : "Como usuario"}
              </h2>
            </div>
          </div>
          <button onClick={dismiss} className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 shrink-0">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {isOrganizer ? (
          <div className="space-y-2">
            <Step icon={ShoppingBag} label="Andá a Suscripciones y elegí una herramienta" />
            <Step icon={CreditCardSimple} label="Pagá tu cupo a precio reducido" />
            <Step icon={Gem} label="Ganás 1 Coin CoStack por ser el primero" />
            <Step icon={Users} label="Otros se suman y dividen el costo" />
            <Step icon={Clock} label="24hs de espera o devolución del 100%" />
            <Step icon={Ban} label="Límite de 2 salas por día como organizador" />
          </div>
        ) : (
          <div className="space-y-2">
            <Step icon={ShoppingBag} label="Andá a Suscripciones y elegí una herramienta" />
            <Step icon={CreditCardSimple} label="Pagá tu cupo a precio reducido" />
            <Step icon={Users} label="Entrás a la sala de espera con otros miembros" />
            <Step icon={Clock} label="Cuando se completa, recibís tu código" />
            <Step icon={ShieldCheck} label="Si no se completa en 24hs, te devolvemos el 100%" />
          </div>
        )}

        <Button onClick={dismiss} className="w-full rounded-xl bg-white hover:bg-zinc-200 text-black font-bold h-10">
          Entendido <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}

function Step({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-cyan-400" />
      </div>
      <span className="text-sm text-zinc-300">{label}</span>
    </div>
  )
}

function CreditCardSimple(props: any) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
