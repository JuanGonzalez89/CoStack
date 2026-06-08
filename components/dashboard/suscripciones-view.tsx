"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Pen,
  GitBranch,
  Search,
  Code,
  Clock,
  Flame,
  ShieldCheck,
  Users,
  Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Modelo de datos B2C (Herramientas, no Grupos)
interface ToolCatalogItem {
  id: string
  name: string
  provider: string
  pricePerMonth: number
  originalPrice: number
  availableSeats: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  category: "AI" | "Design" | "IDE"
  isBusiness?: boolean
}

export const CATALOG_TOOLS: ToolCatalogItem[] = [
  {
    id: "copilot",
    name: "GitHub Copilot",
    provider: "GitHub",
    pricePerMonth: 5,
    originalPrice: 10,
    availableSeats: 2,
    icon: GitBranch,
    iconBg: "bg-slate-200/50",
    iconColor: "text-slate-700",
    category: "AI",
  },
  {
    id: "jetbrains",
    name: "All Products Pack",
    provider: "JetBrains",
    pricePerMonth: 8,
    originalPrice: 28,
    availableSeats: 1,
    icon: Code,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    category: "IDE",
  },
  {
    id: "chatgpt",
    name: "ChatGPT Team",
    provider: "OpenAI",
    pricePerMonth: 15,
    originalPrice: 30,
    availableSeats: 4,
    icon: MessageSquare,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    category: "AI",
  },
  {
    id: "figma",
    name: "Figma Org",
    provider: "Figma Inc.",
    pricePerMonth: 12,
    originalPrice: 45,
    availableSeats: 5,
    icon: Pen,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    category: "Design",
    isBusiness: true,
  },
  {
    id: "midjourney",
    name: "Midjourney Pro",
    provider: "Midjourney",
    pricePerMonth: 15,
    originalPrice: 60,
    availableSeats: 4,
    icon: Pen,
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-500",
    category: "AI",
  },
  {
    id: "vercel",
    name: "Vercel Pro",
    provider: "Vercel",
    pricePerMonth: 5,
    originalPrice: 20,
    availableSeats: 4,
    icon: Code,
    iconBg: "bg-slate-100/10",
    iconColor: "text-slate-100",
    category: "IDE",
  },
  {
    id: "canva",
    name: "Canva Pro Team",
    provider: "Canva",
    pricePerMonth: 6,
    originalPrice: 30,
    availableSeats: 5,
    icon: Pen,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    category: "Design",
    isBusiness: true,
  },
  {
    id: "claude",
    name: "Claude Pro",
    provider: "Anthropic",
    pricePerMonth: 10,
    originalPrice: 20,
    availableSeats: 2,
    icon: MessageSquare,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    category: "AI",
  }
]

export function SuscripcionesView({ isOrganizer = false }: { isOrganizer?: boolean }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<"All" | "AI" | "Design" | "IDE">("All")

  const filteredTools = CATALOG_TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header del Catálogo */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {isOrganizer ? 'Compartir Licencia' : 'Cupos Compartidos Disponibles'}
        </h2>
        <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
          {isOrganizer 
            ? 'Selecciona la herramienta que ya pagas para compartirla con la comunidad. Configura tus credenciales y el sistema llenará tus cupos vacíos para devolverte dinero a tu Billetera.'
            : 'Encuentra cupos disponibles (Automatch) que ya están compartiendo estas herramientas a un menor costo y únete al instante.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck size={14} />
          {isOrganizer ? "Dinero Garantizado 100%" : "Compra Segura con Devolución"}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
          <Users size={14} />
          {isOrganizer ? "Relleno Automático de Cupos" : "Match Automático Inmediato"}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300">
          <Wallet size={14} />
          {isOrganizer ? "Retiros a MercadoPago / Crypto" : "Sin tarjetas de crédito bloqueadas"}
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
          const savings = Math.round((1 - (tool.pricePerMonth / tool.originalPrice)) * 100);

          return (
            <div
              key={tool.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-[24px] border border-white/5 bg-white/[0.02] transition-all duration-300 overflow-hidden hover:border-white/10 hover:bg-white/[0.04] cursor-pointer hover:-translate-y-1"
              )}
            >
              {/* Etiqueta de Escasez / Promoción */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    Admite {tool.availableSeats} miembros
                  </span>
              </div>

              {/* Info de la Herramienta */}
              <div className="flex items-start gap-5 mb-8">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden border border-white/10", tool.iconBg)}>
                  <img 
                    src={`/images/${tool.id}.png`} 
                    alt={tool.name} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.style.display = 'none' }} 
                  />
                  <span className="relative z-10 mix-blend-difference text-white font-bold text-xl">{tool.name.substring(0, 2).toUpperCase()}</span>
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
                    <p className="text-sm text-zinc-500 line-through">Oficial: ${tool.originalPrice}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                      Ahorrás {savings}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-bold tracking-tight text-white">${tool.pricePerMonth}</span>
                    <span className="text-sm font-medium text-zinc-500">/mes por integrante</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button 
                onClick={() => {
                  if (isOrganizer) {
                    router.push(`/suscripciones/share/${tool.id}`)
                  } else {
                    router.push(`/suscripciones/checkout/${tool.id}`)
                  }
                }}
                className="w-full rounded-2xl h-14 font-bold text-base transition-all duration-200 bg-white hover:bg-zinc-200 text-black shadow-none"
              >
                {isOrganizer ? "Compartir esta cuenta" : "Unirse vía Automatch"}
              </Button>
            </div>
          )
        })}

        {filteredTools.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No encontramos herramientas con ese nombre.</p>
          </div>
        )}
      </div>
    </div>
  )
}
