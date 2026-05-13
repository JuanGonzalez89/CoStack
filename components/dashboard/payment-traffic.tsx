"use client"

import { CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react"

const members = [
  {
    name: "Martín Pérez",
    initials: "MP",
    role: "Admin",
    avatar: "M",
    payments: {
      "ChatGPT Plus": "paid",
      Midjourney: "paid",
      "Canva Pro": "paid",
    },
  },
  {
    name: "Juan Pablo",
    initials: "JP",
    role: "Miembro",
    avatar: "J",
    payments: {
      "ChatGPT Plus": "pending",
      Midjourney: "paid",
      "Canva Pro": "overdue",
    },
  },
  {
    name: "Santiago",
    initials: "SA",
    role: "Miembro",
    avatar: "S",
    payments: {
      "ChatGPT Plus": "paid",
      Midjourney: "pending",
      "Canva Pro": "paid",
    },
  },
  {
    name: "Valentina",
    initials: "VR",
    role: "Miembro",
    avatar: "V",
    payments: {
      "ChatGPT Plus": "overdue",
      Midjourney: "paid",
      "Canva Pro": "pending",
    },
  },
]

const tools = ["ChatGPT Plus", "Midjourney", "Canva Pro"]

const statusConfig = {
  paid: {
    label: "Pagado",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pendiente",
    icon: Clock,
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  overdue: {
    label: "Vencido",
    icon: AlertCircle,
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig]
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.badge}`}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

export function PaymentTraffic() {
  const totalPaid = members.reduce(
    (acc, m) => acc + Object.values(m.payments).filter((s) => s === "paid").length,
    0
  )
  const totalAll = members.length * tools.length
  const percent = Math.round((totalPaid / totalAll) * 100)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Semáforo de Pagos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estado del mes actual — Mayo 2026
          </p>
        </div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5 bg-card">
          Mayo 2026 <ChevronDown size={12} />
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Progress header */}
        <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-cyan-500 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {totalPaid}/{totalAll} pagos
            </span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600">
            {percent}% al día
          </span>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-4 bg-muted/30">
          {Object.entries(statusConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              <span className="text-xs text-muted-foreground">{val.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-40">
                  Miembro
                </th>
                {tools.map((tool) => (
                  <th key={tool} className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {tool}
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                const paidCount = Object.values(member.payments).filter((s) => s === "paid").length
                return (
                  <tr
                    key={member.name}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                      i === members.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-cyan-600">{member.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground leading-tight">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    {tools.map((tool) => (
                      <td key={tool} className="px-4 py-3.5 text-center">
                        <StatusBadge status={member.payments[tool as keyof typeof member.payments]} />
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-xs font-semibold ${
                          paidCount === tools.length
                            ? "text-emerald-600"
                            : paidCount === 0
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {paidCount}/{tools.length}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
