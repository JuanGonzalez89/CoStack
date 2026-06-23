import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"
import { StatusBadge } from "./status-badge"

interface HistoryTransactionRowProps {
  id: string
  description: string
  date: string
  amount: number
  status: StatusBadgeStatus
  type: 'income' | 'expense'
}

export function HistoryTransactionRow({ description, date, amount, status, type }: HistoryTransactionRowProps) {
  const isIncome = type === 'income'
  const amountPrefix = isIncome ? "+" : "-"

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-900/50 transition-colors">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
          isIncome ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
        )}
      >
        {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-50 truncate">{description}</p>
        <p className="text-xs text-zinc-500 sm:hidden">{date}</p>
      </div>

      <div className="hidden sm:block shrink-0 w-24">
        <StatusBadge status={status} />
      </div>

      <p className="text-xs text-zinc-500 hidden sm:block shrink-0 w-24 text-right">{date}</p>
      
      <p
        className={cn(
          "text-sm font-semibold w-24 text-right shrink-0",
          isIncome ? "text-emerald-500" : "text-zinc-50"
        )}
      >
        {amountPrefix}${amount.toFixed(2)}
      </p>
    </div>
  )
}
