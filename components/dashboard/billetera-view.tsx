"use client"

import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"
import { BillingHeaderCards } from "./billing-header-cards"
import { HistoryTransactionRow } from "./history-transaction-row"
import { EmptyState } from "./empty-state"
import { Wallet } from "lucide-react"
import { PaymentRetryBanner } from "./payment-retry-banner"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"

export function BilleteraView() {
  const { data, isLoading } = useDashboardSnapshot()
  const payments = data?.latestGroup?.payments ?? []
  
  // En un caso real, el balance viene del backend
  const balance = 0.00
  const nextCharge = payments.filter((payment) => payment.status !== "paid").reduce((acc, payment) => acc + Number(payment.amount), 0)

  const hasOverdue = payments.some(p => p.status === "overdue")

  return (
    <div className="space-y-6">
      {hasOverdue && <PaymentRetryBanner onRetry={() => {}} />}

      <BillingHeaderCards 
        balance={balance} 
        nextCharge={nextCharge} 
        nextChargeDate="30/06/2026"
        isLoading={isLoading} 
      />

      {/* Transaction history */}
      <div>
        <h2 className="text-base font-semibold text-zinc-50 mb-4">Historial de Movimientos</h2>
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="w-8 shrink-0"></div>
            <p className="flex-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Descripción</p>
            <p className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</p>
            <p className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Fecha</p>
            <p className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Monto</p>
          </div>
          
          <div className="divide-y divide-zinc-800/50">
            {payments.map((payment) => (
              <HistoryTransactionRow
                key={payment.id}
                id={payment.id}
                description={`${payment.user.name ?? payment.user.email} · ${payment.tool.name}`}
                date={new Date(payment.createdAt).toLocaleDateString("es-AR")}
                amount={Number(payment.amount)}
                status={payment.status as StatusBadgeStatus}
                type="expense"
              />
            ))}
            
            {!payments.length && !isLoading && (
              <div className="p-8">
                <EmptyState
                  icon={Wallet}
                  title="Sin movimientos"
                  description="Aún no hay transacciones registradas en tu billetera. Aquí verás los pagos realizados y recibidos."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
