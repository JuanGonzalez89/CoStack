"use client"

import { ArrowUpRight, Wallet } from "lucide-react"
import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"

export function BilleteraView() {
  const { data, isLoading } = useDashboardSnapshot()
  const payments = data?.latestGroup?.payments ?? []
  const totalPaid = payments.filter((payment) => payment.status === "paid").reduce((acc, payment) => acc + Number(payment.amount), 0)
  const totalPending = payments.filter((payment) => payment.status !== "paid").reduce((acc, payment) => acc + Number(payment.amount), 0)

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Movimientos persistidos</p>
            <p className="text-3xl font-bold text-white tracking-tight">{isLoading ? "..." : `${payments.length}`}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Pagado</p>
            <p className="text-base font-semibold text-emerald-400">${totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Pendiente</p>
            <p className="text-base font-semibold text-orange-400">${totalPending.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Historial de Movimientos</h2>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Fecha</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right w-24">Monto</p>
          </div>
          <ul className="divide-y divide-border">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${payment.status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
                >
                  <ArrowUpRight size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {payment.user.name ?? payment.user.email} · {payment.tool.name}
                  </p>
                  <p className="text-xs text-muted-foreground sm:hidden">{new Date(payment.createdAt).toLocaleDateString("es-AR")}</p>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block shrink-0">{new Date(payment.createdAt).toLocaleDateString("es-AR")}</p>
                <p
                  className={`text-sm font-semibold w-20 text-right shrink-0 ${
                    payment.status === "paid" ? "text-emerald-600" : "text-orange-600"
                  }`}
                >
                  -${Number(payment.amount).toFixed(2)}
                </p>
              </li>
            ))}
            {!payments.length && !isLoading && (
              <li className="px-5 py-6 text-sm text-muted-foreground">Todavía no hay movimientos registrados.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
