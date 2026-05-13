import { Users, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const tools = [
  {
    name: "ChatGPT Team",
    provider: "OpenAI",
    seats: [
      { name: "Martín Pérez", status: "pending" },
      { name: "Santiago Gómez", status: "paid" },
      { name: "Laura Díaz", status: "paid" },
      { name: "Carlos Ruiz", status: "paid" },
      { name: "Libre", status: "free" },
    ],
    iconLabel: "GPT",
    iconBg: "bg-orange-500/10",
    iconText: "text-orange-600",
  },
  {
    name: "Figma Organization",
    provider: "Figma Inc.",
    seats: [
      { name: "Martín Pérez", status: "paid" },
      { name: "Santiago Gómez", status: "paid" },
      { name: "Laura Díaz", status: "paid" },
      { name: "Carlos Ruiz", status: "overdue" },
      { name: "Ana Torres", status: "paid" },
      { name: "Pedro López", status: "paid" },
      { name: "Valeria Sosa", status: "paid" },
      { name: "Rodrigo Méndez", status: "paid" },
      { name: "Libre", status: "free" },
      { name: "Libre", status: "free" },
    ],
    iconLabel: "FIG",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600",
  },
  {
    name: "Notion Plus",
    provider: "Notion Labs",
    seats: [
      { name: "Martín Pérez", status: "paid" },
      { name: "Santiago Gómez", status: "paid" },
      { name: "Laura Díaz", status: "pending" },
    ],
    iconLabel: "NTN",
    iconBg: "bg-slate-200",
    iconText: "text-slate-700",
  },
]

const statusConfig = {
  paid: { label: "Pagado", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pendiente", icon: Clock, cls: "bg-orange-100 text-orange-700" },
  overdue: { label: "Vencido", icon: AlertTriangle, cls: "bg-red-100 text-red-700" },
  free: { label: "Libre", icon: null, cls: "bg-muted text-muted-foreground" },
}

export function GestionAsientosView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Gestión de Asientos</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Estado de ocupación por herramienta y miembro del equipo</p>
      </div>

      <div className="space-y-4">
        {tools.map((tool) => {
          const paidCount = tool.seats.filter((s) => s.status === "paid").length
          const totalSeats = tool.seats.length
          return (
            <div key={tool.name} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold", tool.iconBg, tool.iconText)}>
                    {tool.iconLabel}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{paidCount}/{totalSeats}</span>
                  <span className="text-xs text-muted-foreground">pagados</span>
                </div>
              </div>

              {/* Seat rows */}
              <ul className="divide-y divide-border">
                {tool.seats.map((seat, i) => {
                  const config = statusConfig[seat.status as keyof typeof statusConfig]
                  const Icon = config.icon
                  return (
                    <li key={i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                          seat.status === "free" ? "bg-muted text-muted-foreground border border-dashed border-border" : "bg-slate-100 text-slate-600"
                        )}>
                          {seat.status === "free" ? "—" : seat.name.charAt(0)}
                        </div>
                        <span className={cn("text-sm", seat.status === "free" ? "text-muted-foreground italic" : "text-foreground font-medium")}>
                          {seat.name}
                        </span>
                      </div>
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", config.cls)}>
                        {Icon && <Icon size={11} />}
                        {config.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
