"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Users, Gem, ArrowRight, CheckCircle, Clock, ShieldCheck, X, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RoleGuideModalProps {
  isOrganizer: boolean
  open: boolean
  onClose: () => void
}

const memberSteps = [
  {
    icon: ShoppingBag,
    title: "1. Elegí una herramienta",
    description: "Andá a Suscripciones, buscá la que necesites y pagá tu cupo.",
  },
  {
    icon: Users,
    title: "2. Esperá en la sala",
    description: "Entrás automáticamente a la sala de espera. Cuando se completen los cupos (según la herramienta), la licencia se activa para todos.",
  },
  {
    icon: ShieldCheck,
    title: "3. Recibí tu licencia",
    description: "Te llega una notificación con tu código de acceso. Lo usás en la herramienta y listo.",
  },
]

const organizerSteps = [
  {
    icon: ShoppingBag,
    title: "1. Elegí y pagá primero",
    description: "Andá a Suscripciones, elegí una herramienta y pagá. Como sos el primero, otros se van a sumar después.",
  },
  {
    icon: Gem,
    title: "Ganás 1 Coin CoStack",
    description: "Por iniciar la compra recibís una moneda de incentivo. Pronto vas a poder usarla.",
  },
  {
    icon: Ban,
    title: "Límite: 2 salas por día",
    description: "Para que todos tengan oportunidad de iniciar, solo podés crear 2 salas cada 24 horas. Si querés más, esperá a que una se complete o intentá al día siguiente.",
  },
  {
    icon: Users,
    title: "2. Otros se suman",
    description: "Cuando se completen todos los cupos, la licencia se activa y todos acceden al mismo precio reducido.",
  },
  {
    icon: Clock,
    title: "3. Tiempo límite 24hs",
    description: "Si no se completa la sala en 24 horas, todos recuperan su plata automáticamente. Sin riesgo.",
  },
]

export function RoleGuideModal({ isOrganizer, open, onClose }: RoleGuideModalProps) {
  const [step, setStep] = useState(0)
  const steps = isOrganizer ? organizerSteps : memberSteps

  useEffect(() => {
    if (open) {
      setStep(0)
    }
  }, [open])

  const handleClose = () => {
    const key = `costack_role_guide_${isOrganizer ? "org" : "member"}`
    localStorage.setItem(key, "true")
    onClose()
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  if (!open) return null

  const current = steps[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/10 text-white max-w-lg w-full rounded-3xl p-8 space-y-6 mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isOrganizer ? "bg-cyan-500/10 text-cyan-400" : "bg-emerald-500/10 text-emerald-400",
          )}>
            <current.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              {isOrganizer ? "Organizador" : "Miembro"} · Paso {step + 1} de {steps.length}
            </p>
            <h3 className="text-xl font-bold text-white">{current.title}</h3>
          </div>
        </div>

        <p className="text-base text-white leading-relaxed font-medium">
          {current.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step
                    ? isOrganizer ? "w-6 bg-cyan-400" : "w-6 bg-emerald-400"
                    : "w-1.5 bg-zinc-700",
                )}
              />
            ))}
          </div>
          <Button
            onClick={handleNext}
            className="rounded-xl bg-white hover:bg-zinc-200 text-black font-bold h-10 px-5"
          >
            {step < steps.length - 1 ? (
              <>
                Siguiente <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            ) : (
              "Entendido"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
