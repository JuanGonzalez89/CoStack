"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Flame, ShieldCheck, Users, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatCurrency } from "@/lib/utils"
import { LicenseDetailModal } from "@/components/suscripciones/license-detail-modal"
import { CATALOG } from "@/lib/catalog"

export function SuscripcionesView({ isOrganizer = false }: { isOrganizer?: boolean }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<"All" | "AI" | "Design" | "IDE">("All")
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const filteredTools = CATALOG.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    // Las herramientas disponibles ("live") van primero; las "soon" al final.
    if (a.status === b.status) return 0
    return a.status === "live" ? -1 : 1
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header del Catálogo */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {isOrganizer ? 'Catálogo de herramientas para tu Espacio' : 'Grupos Compartidos Disponibles'}
        </h2>
        <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
          {isOrganizer 
            ? 'Encuentra licencias premium a una fracción del costo para compartir con tu equipo. Selecciona la herramienta, confirma el pago y genera el código de invitación.'
            : 'Encuentra grupos públicos (Automatch) que ya están compartiendo estas herramientas a un menor costo y únete al instante.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck size={14} />
          Compra Segura — Pago Protegido
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
          <Users size={14} />
          Sala de espera en tiempo real
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            placeholder="Buscar por herramienta o proveedor (ej. JetBrains)..."
            className="pl-12 h-14 bg-white/[0.02] border-white/5 text-white placeholder:text-zinc-500 rounded-2xl focus-visible:ring-cyan-500/20 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "AI", "Design", "IDE"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                activeCategory === cat 
                  ? "bg-cyan-500 text-black border-cyan-500" 
                  : "bg-white/[0.02] text-zinc-400 border-white/5 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              {cat === "All" ? "Todas" : cat === "Design" ? "Diseño" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de Herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const isSoldOut = tool.availableSeats === 0;
          const isLive = tool.status === "live";
          const savings = Math.round((1 - (tool.pricePerMonth / tool.originalPrice)) * 100);

          return (
            <div
              key={tool.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-[24px] border border-white/5 bg-white/[0.02] transition-all duration-300 overflow-hidden",
                isLive
                  ? "hover:border-white/10 hover:bg-white/[0.04] cursor-pointer hover:-translate-y-1"
                  : "opacity-55 grayscale-[0.4]"
              )}
            >
              {/* Etiqueta de Escasez / Promoción */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isLive ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    Admite {tool.availableSeats} miembros
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-400/10 px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    Próximamente
                  </span>
                )}
              </div>

              {/* Info de la Herramienta */}
              <div className="flex items-start gap-5 mb-8">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", tool.iconBg)}>
                  <tool.icon className={cn("w-8 h-8", tool.iconColor)} />
                </div>
                <div className="pt-2">
                  <p className="text-sm font-semibold text-cyan-400 mb-1">{tool.provider}</p>
                  <h3 className="text-xl font-bold text-white leading-tight">{tool.name}</h3>
                </div>
              </div>

              {/* Precios y Ahorro */}
              <div className="mt-auto pt-5 border-t border-white/5 flex items-end justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-zinc-500 line-through">Oficial: ${formatCurrency(tool.originalPrice)}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                      Ahorrás {savings}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-bold tracking-tight text-white">${formatCurrency(tool.pricePerMonth)}</span>
                    <span className="text-sm font-medium text-zinc-500">/mes por integrante</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {isLive ? (
                <Button
                  onClick={() => setSelectedTool(tool.id)}
                  className="w-full rounded-2xl h-14 font-bold text-base transition-all duration-200 bg-white hover:bg-zinc-200 text-black shadow-none"
                >
                  {isOrganizer ? "Configurar Grupo y Añadir" : "Unirse vía Automatch"}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full rounded-2xl h-14 font-bold text-base bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed hover:bg-white/5"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Próximamente
                </Button>
              )}
            </div>
          )
        })}

        {filteredTools.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No encontramos herramientas con ese nombre.</p>
          </div>
        )}
      </div>

      <LicenseDetailModal
        toolSlug={selectedTool}
        isOrganizer={isOrganizer}
        onClose={() => setSelectedTool(null)}
      />
    </div>
  )
}
