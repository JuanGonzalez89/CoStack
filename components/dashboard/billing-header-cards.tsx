import { Wallet, CalendarClock } from "lucide-react"
import { WithdrawFundsModal } from "./withdraw-funds-modal"

interface BillingHeaderCardsProps {
  balance: number
  nextCharge: number
  nextChargeDate?: string
  isLoading?: boolean
  isOrganizer?: boolean
}

export function BillingHeaderCards({ balance, nextCharge, nextChargeDate, isLoading, isOrganizer = false }: BillingHeaderCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Saldo Actual / Fondos Escrow */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {isOrganizer ? "Fondos en retención (Escrow)" : "Estado de cuenta"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-zinc-50 tracking-tight">
              {isLoading ? "..." : `$${balance.toFixed(2)}`}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {isOrganizer ? "A liberarse el próximo ciclo" : "Disponible"}
            </p>
          </div>
          {isOrganizer && (
            <WithdrawFundsModal balance={balance}>
              <button className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold transition-colors hover:bg-zinc-200 shadow-sm whitespace-nowrap">
                Retirar Fondos
              </button>
            </WithdrawFundsModal>
          )}
        </div>
      </div>

      {/* Próximo Cobro */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {isOrganizer ? "Recaudación estimada" : "Próxima cuota"}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-zinc-50 tracking-tight">
              {isLoading ? "..." : `$${nextCharge.toFixed(2)}`}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {nextChargeDate ? `Fecha de corte: ${nextChargeDate}` : 'Calculando...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
