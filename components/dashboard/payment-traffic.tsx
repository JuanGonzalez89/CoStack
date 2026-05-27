"use client"

import { ChevronDown } from "lucide-react"
import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"
import { StatusBadge } from '@/components/dashboard/status-badge'

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
          <h2 className="text-base font-semibold text-zinc-50">Semáforo de Pagos</h2>
          <p className="mt-0.5 text-xs text-slate-300">Estado real de pagos persistidos</p>
        </div>
        <button className="flex items-center gap-1 rounded-lg border border-cyan-500/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:text-cyan-100">
          Snapshot actual <ChevronDown size={12} />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
        <div className="flex items-center justify-between gap-4 border-b border-white/5 px-5 pb-4 pt-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-800/90">
              <div className="h-2 rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
            <span className="whitespace-nowrap text-sm font-semibold text-zinc-50">
              {totalPaid}/{totalAll} pagos
            </span>
          </div>
          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
            {percent}% al día
          </span>
        </div>

        <div className="flex items-center gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-300">Pagado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-300">Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-300">Vencido</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 w-40">Miembro</th>
                {tools.map((tool) => (
                  <th key={tool} className="text-center px-4 py-3 text-xs font-semibold text-slate-400">
                    {tool}
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                const memberName = member.user.name ?? member.user.email
                const paidCount = tools.filter((tool) => statusByMemberAndTool(member.user.email, tool) === "paid").length

                return (
                  <tr
                    key={member.user.email}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${i === members.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-cyan-400/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-cyan-100">{memberName.slice(0, 1).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight text-zinc-50">{memberName}</p>
                          <p className="text-[10px] text-slate-400">{member.role}</p>
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
                          paidCount === tools.length ? "text-emerald-300" : paidCount === 0 ? "text-red-300" : "text-amber-300"
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
                  <td className="px-5 py-6 text-sm text-slate-400" colSpan={tools.length + 2}>
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
