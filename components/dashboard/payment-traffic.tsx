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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Actividad de pagos</h2>
          <p className="mt-1 text-sm text-zinc-400">Estado actual de pagos del espacio</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-white hover:bg-white/[0.04]">
          Vista actual <ChevronDown size={16} />
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.02] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
        <div className="flex items-center justify-between gap-6 border-b border-white/5 px-6 pb-5 pt-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 h-3 overflow-hidden rounded-full bg-black/40 border border-white/5">
              <div className="h-3 rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
            <span className="whitespace-nowrap text-base font-semibold text-zinc-50">
              {totalPaid}/{totalAll} pagos
            </span>
          </div>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-400">
            {percent}% al día
          </span>
        </div>

        <div className="flex items-center gap-6 border-b border-white/5 bg-white/[0.01] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-zinc-400">Pagado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium text-zinc-400">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-zinc-400">Vencido</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-black/10">
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 w-48">Miembro</th>
                {tools.map((tool) => (
                  <th key={tool} className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {tool}
                  </th>
                ))}
                <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                const memberName = member.user.name ?? member.user.email
                const paidCount = tools.filter((tool) => statusByMemberAndTool(member.user.email, tool) === "paid").length

                return (
                  <tr
                    key={member.user.email}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${i === members.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-zinc-300">{memberName.slice(0, 1).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-50">{memberName}</p>
                          <p className="text-xs text-zinc-500">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    {tools.map((tool) => (
                      <td key={tool} className="px-4 py-4 text-center">
                        <StatusBadge status={statusByMemberAndTool(member.user.email, tool)} />
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-bold ${
                          paidCount === tools.length ? "text-emerald-400" : paidCount === 0 ? "text-red-400" : "text-amber-400"
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
                  <td className="px-6 py-8 text-sm text-zinc-500 text-center" colSpan={tools.length + 2}>
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
