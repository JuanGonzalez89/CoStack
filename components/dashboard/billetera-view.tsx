import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"

const transactions = [
  { id: 1, desc: "Pago ChatGPT Team – Asiento Mayo", date: "10 May 2026", amount: -30.0, type: "debit" },
  { id: 2, desc: "Pago Figma Organization – Asiento Mayo", date: "10 May 2026", amount: -45.0, type: "debit" },
  { id: 3, desc: "Pago Notion Plus – Asiento Mayo", date: "09 May 2026", amount: -16.0, type: "debit" },
  { id: 4, desc: "Recarga de billetera", date: "08 May 2026", amount: 100.0, type: "credit" },
  { id: 5, desc: "Pago Midjourney – Asiento Abril", date: "01 May 2026", amount: -10.0, type: "debit" },
  { id: 6, desc: "Recarga de billetera", date: "28 Abr 2026", amount: 50.0, type: "credit" },
  { id: 7, desc: "Pago Canva Pro – Asiento Abril", date: "25 Abr 2026", amount: -15.0, type: "debit" },
]

export function BilleteraView() {
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Balance disponible</p>
            <p className="text-3xl font-bold text-white tracking-tight">
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Total ingresado</p>
            <p className="text-base font-semibold text-emerald-400">
              +${transactions.filter((t) => t.type === "credit").reduce((a, t) => a + t.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Total gastado</p>
            <p className="text-base font-semibold text-orange-400">
              -${Math.abs(transactions.filter((t) => t.type === "debit").reduce((a, t) => a + t.amount, 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Historial de Transacciones</h2>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Fecha</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right w-24">Monto</p>
          </div>
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {t.type === "credit" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.desc}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">{t.date}</p>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block shrink-0">{t.date}</p>
                <p
                  className={`text-sm font-semibold w-20 text-right shrink-0 ${
                    t.type === "credit" ? "text-emerald-600" : "text-orange-600"
                  }`}
                >
                  {t.type === "credit" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
