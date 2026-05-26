import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SeatRow } from "./seat-row"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"

// Mock data (en el futuro vendrá de una API o store)
const tools = [
  {
    name: "ChatGPT Team",
    provider: "OpenAI",
    seats: [
      { name: "Martín Pérez", email: "martin@example.com", status: "pending" as StatusBadgeStatus },
      { name: "Santiago Gómez", email: "santiago@example.com", status: "paid" as StatusBadgeStatus },
      { name: "Laura Díaz", email: "laura@example.com", status: "paid" as StatusBadgeStatus },
      { name: "Carlos Ruiz", email: "carlos@example.com", status: "paid" as StatusBadgeStatus },
      { name: "Libre", email: "", status: "free" },
    ],
    iconLabel: "GPT",
    iconBg: "bg-orange-500/10",
    iconText: "text-orange-500",
  },
  {
    name: "Figma Organization",
    provider: "Figma Inc.",
    seats: [
      { name: "Martín Pérez", email: "martin@example.com", status: "paid" as StatusBadgeStatus },
      { name: "Santiago Gómez", email: "santiago@example.com", status: "paid" as StatusBadgeStatus },
      { name: "Laura Díaz", email: "laura@example.com", status: "paid" as StatusBadgeStatus },
      { name: "Carlos Ruiz", email: "carlos@example.com", status: "overdue" as StatusBadgeStatus },
      { name: "Libre", email: "", status: "free" },
    ],
    iconLabel: "FIG",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-500",
  },
]

export function GestionAsientosView() {
  // Simulamos que el usuario actual es organizador
  const isOrganizer = true

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-50">Gestión de Asientos</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Estado de ocupación por herramienta y miembro del equipo</p>
      </div>

      <div className="space-y-4">
        {tools.map((tool) => {
          const paidCount = tool.seats.filter((s) => s.status === "paid").length
          const totalSeats = tool.seats.length
          return (
            <div key={tool.name} className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border border-zinc-800", tool.iconBg, tool.iconText)}>
                    {tool.iconLabel}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-50">{tool.name}</p>
                    <p className="text-xs text-zinc-400">{tool.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <Users size={13} className="text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-50">{paidCount}/{totalSeats}</span>
                  <span className="text-xs text-zinc-400">pagados</span>
                </div>
              </div>

              {/* Seat Header (Table-like) */}
              <div className="grid grid-cols-2 px-5 py-2 border-b border-zinc-800 bg-zinc-900/20 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <div>Miembro</div>
                <div className="text-right pr-4">Estado & Acciones</div>
              </div>

              {/* Seat rows */}
              <div className="divide-y divide-zinc-800/50">
                {tool.seats.map((seat, i) => (
                  <SeatRow 
                    key={i} 
                    name={seat.name} 
                    status={seat.status as StatusBadgeStatus | 'free'} 
                    email={seat.email}
                    isOrganizer={isOrganizer}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
