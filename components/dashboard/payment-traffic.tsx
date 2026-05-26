"use client"

import { CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react"
import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"

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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.badge}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

export function PaymentTraffic() {
  const { data } = useDashboardSnapshot()
  const members = data?.latestGroup?.members ?? []
  const payments = data?.latestGroup?.payments ?? []
  const tools = Array.from(new Set(payments.map((payment) => payment.tool.name)))

  const totalPaid = payments.filter((payment) => payment.status === "paid").length
  const totalAll = payments.length || 1
  const percent = Math.round((totalPaid / totalAll) * 100)

  const statusByMemberAndTool = (memberEmail: string, toolName: string) => {
    const match = payments.find(
      (payment) => (payment.user.email === memberEmail || payment.user.name === memberEmail) && payment.tool.name === toolName,
    )

    return match?.status ?? "pending"
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Semáforo de Pagos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Estado real de pagos persistidos</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5 bg-card">
          Snapshot actual <ChevronDown size={12} />
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {totalPaid}/{totalAll} pagos
            </span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600">
            {percent}% al día
          </span>
        </div>

        <div className="px-5 py-3 border-b border-border flex items-center gap-4 bg-muted/30">
          {Object.entries(statusConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              <span className="text-xs text-muted-foreground">{val.label}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-40">Miembro</th>
                {tools.map((tool) => (
                  <th key={tool} className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {tool}
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                const memberName = member.user.name ?? member.user.email
                const paidCount = tools.filter((tool) => statusByMemberAndTool(member.user.email, tool) === "paid").length

                return (
                  <tr
                    key={member.user.email}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i === members.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-cyan-600">{memberName.slice(0, 1).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground leading-tight">{memberName}</p>
                          <p className="text-[10px] text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    {tools.map((tool) => (
                      <td key={tool} className="px-4 py-3.5 text-center">
                        <StatusBadge status={statusByMemberAndTool(member.user.email, tool)} />
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-xs font-semibold ${
                          paidCount === tools.length ? "text-emerald-600" : paidCount === 0 ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {paidCount}/{tools.length || 1}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!members.length && (
                <tr>
                  <td className="px-5 py-6 text-sm text-muted-foreground" colSpan={tools.length + 2}>
                    Todavía no hay miembros persistidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
