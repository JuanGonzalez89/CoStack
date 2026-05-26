"use client"

import { useState } from "react"
import {
  MessageSquare,
  Pen,
  GitBranch,
  Plus,
  ArrowRight,
  FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { EmptyState } from "./empty-state"
import { RoleFilterBar, RoleFilterOption } from "./role-filter-bar"
import { cn } from "@/lib/utils"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"

// Interfaz adaptada para el layout de lista
interface SubscriptionRow {
  id: string
  name: string
  provider: string
  pricePerSeat: number
  seatsAvailable: number
  seatsTotal: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  role: "organizer" | "member"
  status: StatusBadgeStatus
}

// Datos de ejemplo (mock) hasta que conectemos con lib/dashboard-snapshot.ts
const subscriptions: SubscriptionRow[] = [
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
    role: "organizer",
    status: "paid",
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
    role: "member",
    status: "paid",
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
    role: "member",
    status: "pending",
  }
]

export function SuscripcionesView() {
  const [filter, setFilter] = useState<RoleFilterOption>("all")
  
  // Si no hay suscripciones en total, mostramos EmptyState
  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No tienes suscripciones activas"
        description="Aún no eres parte de ninguna herramienta compartida. Puedes crear tu propio grupo o unirte a uno existente."
        variant="action"
        cta={{ label: "Crear grupo", href: "/onboarding/herramienta" }}
        secondaryCta={{ label: "Tengo un código", href: "/onboarding/unirse" }}
      />
    )
  }

  const filteredSubs = subscriptions.filter(
    (sub) => filter === "all" || sub.role === filter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Suscripciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus herramientas compartidas y el acceso del equipo.
          </p>
        </div>
        <Button className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-sm w-full sm:w-auto">
          <Plus size={16} className="mr-2" />
          Nueva suscripción
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex justify-start">
        <RoleFilterBar value={filter} onChange={setFilter} />
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filteredSubs.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">No se encontraron suscripciones para este filtro.</p>
          </div>
        ) : (
          filteredSubs.map((sub) => {
            const isFull = sub.seatsAvailable === 0
            return (
              <div
                key={sub.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:border-zinc-700 transition-colors"
              >
                {/* Info principal */}
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", sub.iconBg)}>
                    <sub.icon className={cn("w-5 h-5", sub.iconColor)} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-none mb-1.5">{sub.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-zinc-300">{sub.role === 'organizer' ? 'Organizador' : 'Miembro'}</span>
                      <span>•</span>
                      <span className="font-mono">${sub.pricePerSeat}/mes cuota</span>
                    </div>
                  </div>
                </div>

                {/* Info secundaria / Acciones */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t border-border sm:border-0 pt-3 sm:pt-0">
                  <div className="flex flex-col gap-1.5 sm:text-right">
                    <span className="text-xs text-muted-foreground">Asientos</span>
                    <span className={cn("text-sm font-semibold", isFull ? "text-amber-500" : "text-emerald-500")}>
                      {sub.seatsTotal - sub.seatsAvailable}/{sub.seatsTotal} ocupados
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={sub.status} size="sm" />
                  </div>

                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg hidden sm:flex">
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
