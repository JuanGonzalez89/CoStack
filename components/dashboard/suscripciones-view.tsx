"use client"

import { useState } from "react"
import {
  MessageSquare,
  Pen,
  GitBranch,
  Search,
  Code,
  Flame,
  Clock
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
}

const CATALOG_TOOLS: ToolCatalogItem[] = [
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
    availableSeats: 0, // Agotado
    icon: Pen,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    category: "Design",
  }
]

export function SuscripcionesView() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredTools = CATALOG_TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.provider.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header del Catálogo */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Catálogo de Herramientas</h2>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Encuentra licencias premium a una fracción del costo. Selecciona tu herramienta, confirma el pago y nuestro Auto-Match te asignará al instante.
        </p>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por herramienta o proveedor (ej. JetBrains)..." 
            className="pl-9 bg-card border-border rounded-xl focus-visible:ring-cyan-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 overflow-hidden"
            >
              {/* Etiqueta de Escasez / Promoción */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {!isSoldOut ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    {tool.availableSeats} lugares
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    Agotado
                  </span>
                )}
              </div>

              {/* Info de la Herramienta */}
              <div className="flex items-start gap-4 mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", tool.iconBg)}>
                  <tool.icon className={cn("w-7 h-7", tool.iconColor)} />
                </div>
                <div className="pt-1">
                  <p className="text-xs font-semibold text-cyan-500 mb-0.5">{tool.provider}</p>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{tool.name}</h3>
                </div>
              </div>

              {/* Precios y Ahorro */}
              <div className="mt-auto pt-4 border-t border-border flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground line-through mb-0.5">Precio oficial: ${tool.originalPrice}/mes</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-foreground">${tool.pricePerMonth}</span>
                    <span className="text-sm font-medium text-muted-foreground">/mes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                    Ahorras {savings}%
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Button 
                disabled={isSoldOut}
                className={cn(
                  "w-full rounded-xl py-6 font-bold shadow-sm transition-all",
                  !isSoldOut 
                    ? "bg-cyan-500 hover:bg-cyan-400 text-white" 
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                )}
              >
                {!isSoldOut ? "Comprar acceso ahora" : "Unirme a lista de espera"}
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
