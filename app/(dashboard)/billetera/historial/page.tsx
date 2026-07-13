import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const history = [
  { id: '1', type: 'income', description: 'Cobro de ChatGPT Team · Martín Pérez', amount: 30.0, date: '2026-05-18' },
  { id: '2', type: 'expense', description: 'Pago de Figma Organization · OpenClaw', amount: 45.0, date: '2026-05-16' },
  { id: '3', type: 'income', description: 'Cobro de Notion Plus · Laura Díaz', amount: 17.0, date: '2026-05-15' },
]

export default function WalletHistoryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Billetera</p>
        <h1 className="text-2xl font-bold text-foreground">Historial extendido</h1>
        <p className="text-sm text-muted-foreground">Movimientos persistidos con vista histórica para revisión y métricas futuras.</p>
      </header>

      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_auto_auto] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Descripción</span>
          <span className="text-right">Fecha</span>
          <span className="text-right">Monto</span>
        </div>
        <ul className="divide-y divide-border">
          {history.map((item) => (
            <li key={item.id} className="grid grid-cols-[1.5fr_auto_auto] gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={item.type === 'income' ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500'}>
                  {item.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">{item.date}</p>
                </div>
              </div>
              <span className="self-center text-xs text-muted-foreground">{item.date}</span>
              <span className={item.type === 'income' ? 'self-center text-right font-mono text-sm font-semibold text-emerald-500' : 'self-center text-right font-mono text-sm font-semibold text-red-500'}>
                {item.type === 'income' ? '+' : '-'}${formatCurrency(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}