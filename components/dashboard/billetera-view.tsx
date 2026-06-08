"use client"
import { useState } from "react"

import { useDashboardSnapshot } from "@/components/dashboard/use-dashboard-snapshot"
import { BillingHeaderCards } from "./billing-header-cards"
import { HistoryTransactionRow } from "./history-transaction-row"
import { EmptyState } from "./empty-state"
import { Wallet, Receipt } from "lucide-react"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"

export function BilleteraView({ isOrganizer }: { isOrganizer?: boolean }) {
  const { data, isLoading } = useDashboardSnapshot()
  const [activeTab, setActiveTab] = useState<"all" | "incomes" | "expenses">("all")
  
  // --- FASE 2: Sumar TODOS los grupos donde el usuario participa ---
  const allPayments = data?.activeGroups?.flatMap(g => g.payments ?? []) ?? []

  const organizerEmail = data?.latestGroup?.members?.find(m => m.role === 'organizer')?.user?.email

  // MRR real: suma de pagos 'paid' de todos los grupos
  const mrr = isOrganizer
    ? allPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0)
    : 0

  const balance = isOrganizer ? mrr : 0

  const processedPayments = allPayments.map(payment => {
    const isIncome = isOrganizer && payment.user.email !== organizerEmail
    return { ...payment, type: isIncome ? "income" : "expense" }
  })

  const filteredPayments = processedPayments.filter(payment => {
    if (activeTab === "all") return true
    if (activeTab === "incomes") return payment.type === "income"
    if (activeTab === "expenses") return payment.type === "expense"
    return true
  })

  // Vista simplificada para compradores (no organizadores)
  if (!isOrganizer) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-white">Historial de Pagos</h2>
          <p className="text-sm text-zinc-400">Todos tus pagos de suscripciones en CoStack.</p>
        </div>

        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="w-8 shrink-0" />
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
                description={`${payment.tool.name}`}
                date={new Date(payment.createdAt).toLocaleDateString("es-AR")}
                amount={Number(payment.amount)}
                status={payment.status as StatusBadgeStatus}
                type="expense"
              />
            ))}
            {!filteredPayments.length && !isLoading && (
              <div className="p-8">
                <EmptyState
                  icon={Receipt}
                  title="Sin pagos registrados"
                  description="Cuando compres tu primera suscripción, aparecerá aquí."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <BillingHeaderCards 
        isOrganizer={isOrganizer}
        balance={balance} 
        nextCharge={mrr} 
        nextChargeDate="30/06/2026"
        isLoading={isLoading} 
      />

      {/* Transaction history */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold text-white">Historial de Movimientos</h2>
          
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
                {tab === "all" ? "Todos" : tab === "incomes" ? "Ingresos" : "Gastos"}
              </button>
            ))}
          </div>
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
                description={`${payment.user.name ?? payment.user.email} · ${payment.tool.name}`}
                date={new Date(payment.createdAt).toLocaleDateString("es-AR")}
                amount={Number(payment.amount)}
                status={payment.status as StatusBadgeStatus}
                type={payment.type as "income" | "expense"}
              />
            ))}
            
            {!filteredPayments.length && !isLoading && (
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
