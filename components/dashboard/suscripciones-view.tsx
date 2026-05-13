"use client"

import { useState } from "react"
import {
  MessageSquare,
  Pen,
  GitBranch,
  Triangle,
  Brush,
  Sparkles,
  Check,
  ArrowRight,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SoftwareCard {
  id: string
  name: string
  provider: string
  pricePerSeat: number
  seatsAvailable: number
  seatsTotal: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  accentBar: string
  badge?: string
  features: string[]
  subscribed: boolean
}

const catalog: SoftwareCard[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Team Workspace",
    provider: "OpenAI",
    pricePerSeat: 30,
    seatsAvailable: 2,
    seatsTotal: 5,
    icon: MessageSquare,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    accentBar: "bg-orange-500",
    badge: "Popular",
    features: ["GPT-4o acceso completo", "Historial compartido", "Plugins del equipo"],
    subscribed: true,
  },
  {
    id: "figma",
    name: "Figma Organization",
    provider: "Figma Inc.",
    pricePerSeat: 45,
    seatsAvailable: 0,
    seatsTotal: 10,
    icon: Pen,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    accentBar: "bg-violet-500",
    features: ["Proyectos ilimitados", "Variables y tokens", "Dev Mode habilitado"],
    subscribed: true,
  },
  {
    id: "midjourney",
    name: "Midjourney Pro",
    provider: "Midjourney",
    pricePerSeat: 60,
    seatsAvailable: 3,
    seatsTotal: 5,
    icon: Brush,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
    accentBar: "bg-sky-500",
    badge: "Nuevo",
    features: ["Generación ilimitada", "Modo rápido", "Estilos personalizados"],
    subscribed: false,
  },
  {
    id: "copilot",
    name: "GitHub Copilot Enterprise",
    provider: "GitHub",
    pricePerSeat: 39,
    seatsAvailable: 4,
    seatsTotal: 8,
    icon: GitBranch,
    iconBg: "bg-slate-200/50",
    iconColor: "text-slate-700",
    accentBar: "bg-slate-600",
    features: ["Autocompletado en IDE", "Chat contextual", "Revisión de PR con IA"],
    subscribed: false,
  },
  {
    id: "vercel",
    name: "Vercel Pro",
    provider: "Vercel",
    pricePerSeat: 20,
    seatsAvailable: 5,
    seatsTotal: 5,
    icon: Triangle,
    iconBg: "bg-slate-900/10",
    iconColor: "text-slate-800",
    accentBar: "bg-slate-800",
    badge: "Oferta",
    features: ["Deploys ilimitados", "Analytics avanzados", "Bandwidth 1 TB"],
    subscribed: false,
  },
  {
    id: "canva",
    name: "Canva Pro Team",
    provider: "Canva",
    pricePerSeat: 17,
    seatsAvailable: 6,
    seatsTotal: 10,
    icon: Sparkles,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600",
    accentBar: "bg-cyan-500",
    features: ["Brand Kit compartido", "Fondo removido", "Programación de redes"],
    subscribed: false,
  },
]

const badgeStyle: Record<string, string> = {
  Popular: "bg-orange-100 text-orange-700",
  Nuevo: "bg-sky-100 text-sky-700",
  Oferta: "bg-emerald-100 text-emerald-700",
}

export function SuscripcionesView() {
  const [cards, setCards] = useState(catalog)

  const handleSubscribe = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, subscribed: true, seatsAvailable: Math.max(0, c.seatsAvailable - 1) } : c))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Catálogo de Suscripciones</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Herramientas enterprise disponibles para compartir en tu equipo
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-xl">
          <Star size={13} className="text-amber-500" />
          <span>
            <span className="font-semibold text-foreground">
              {cards.filter((c) => c.subscribed).length}
            </span>{" "}
            suscripciones activas
          </span>
        </div>
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isFull = card.seatsAvailable === 0
          return (
            <div
              key={card.id}
              className={cn(
                "bg-card rounded-2xl border shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300",
                card.subscribed ? "border-cyan-200 shadow-cyan-50" : "border-border"
              )}
            >
              {/* Accent stripe */}
              <div className={cn("h-1 w-full", card.accentBar)} />

              <div className="p-5 flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.iconBg)}>
                      <card.icon className={cn("w-5 h-5", card.iconColor)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{card.name}</p>
                      <p className="text-xs text-muted-foreground">{card.provider}</p>
                    </div>
                  </div>
                  {card.badge && (
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", badgeStyle[card.badge])}>
                      {card.badge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">${card.pricePerSeat}</span>
                  <span className="text-xs text-muted-foreground">/mes por asiento</span>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check size={12} className="text-cyan-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Seat availability */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                  <span className="text-muted-foreground">Asientos disponibles</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isFull ? "text-red-500" : card.seatsAvailable <= 2 ? "text-amber-500" : "text-emerald-600"
                    )}
                  >
                    {isFull ? "Lleno" : `${card.seatsAvailable}/${card.seatsTotal} libres`}
                  </span>
                </div>

                {/* CTA */}
                {card.subscribed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full rounded-xl border-cyan-300 text-cyan-700 bg-cyan-50 font-semibold gap-2 cursor-default"
                  >
                    <Check size={14} />
                    Suscrito
                  </Button>
                ) : isFull ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full rounded-xl opacity-50 font-semibold gap-2"
                  >
                    Sin asientos disponibles
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold gap-2 transition-all duration-150"
                    onClick={() => handleSubscribe(card.id)}
                  >
                    Suscribirse
                    <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
