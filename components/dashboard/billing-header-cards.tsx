import { Wallet, CalendarClock } from "lucide-react"

interface BillingHeaderCardsProps {
  balance: number
  nextCharge: number
  nextChargeDate?: string
  isLoading?: boolean
}

export function BillingHeaderCards({ balance, nextCharge, nextChargeDate, isLoading }: BillingHeaderCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Saldo Actual */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">Saldo actual</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-zinc-50 tracking-tight">
            {isLoading ? "..." : `$${balance.toFixed(2)}`}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Disponible en tu cuenta</p>
        </div>
      </div>

      {/* Próximo Cobro */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-zinc-400">Próximo cobro estimado</p>
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
