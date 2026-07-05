"use client"
import { useState } from "react"

import { HistoryTransactionRow } from "./history-transaction-row"
import { EmptyState } from "./empty-state"
import { Wallet } from "lucide-react"
import { PaymentRetryBanner } from "./payment-retry-banner"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"

interface PaymentData {
  id: string
  amount: number
  status: string
  createdAt: string
  description: string
  toolName: string
}

export function BilleteraView({ isOrganizer, initialPayments, balance, nextCharge }: { isOrganizer?: boolean; initialPayments: PaymentData[]; balance: number; nextCharge: number }) {
  const [activeTab, setActiveTab] = useState<"all" | "incomes" | "expenses">("all")

  const hasOverdue = initialPayments.some(p => p.status === "overdue")

  const filteredPayments = initialPayments.filter(payment => {
    if (activeTab === "all") return true
    if (activeTab === "incomes") return payment.status === "paid"
    if (activeTab === "expenses") return payment.status !== "paid"
    return true
  })

  return (
    <div className="space-y-6">
      {hasOverdue && <PaymentRetryBanner href="/suscripciones" />}

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Historial de pagos</h1>
        <p className="text-sm text-zinc-400">Todos tus pagos y movimientos en un solo lugar.</p>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold text-white">Historial de Movimientos</h2>

          {isOrganizer && (
            <div className="flex items-center gap-1 rounded-xl bg-white/[0.02] border border-white/5 p-1">
              {(["all", "incomes", "expenses"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  {tab === "all" ? "Todos" : tab === "incomes" ? "Pagados" : "Pendientes"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="w-8 shrink-0"></div>
            <p className="flex-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Descripción</p>
            <p className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide">Estado</p>
            <p className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Fecha</p>
            <p className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Monto</p>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {filteredPayments.map((payment) => (
              <HistoryTransactionRow
                key={payment.id}
                id={payment.id}
                description={payment.description}
                date={new Date(payment.createdAt).toLocaleDateString("es-AR")}
                amount={payment.amount}
                status={payment.status as StatusBadgeStatus}
                type="expense"
              />
            ))}

            {!filteredPayments.length && (
              <div className="p-8">
                <EmptyState
                  icon={Wallet}
                  title="Sin movimientos"
                  description={activeTab === "all" ? "Aún no hay transacciones registradas." : `No tienes transacciones en la categoría de ${activeTab === 'incomes' ? 'ingresos' : 'gastos'}.`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
