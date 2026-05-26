import { CalendarClock, DollarSign, Layers, Users } from 'lucide-react'
import type { DashboardSnapshot } from '@/lib/dashboard-snapshot'

type SummaryCard = {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  color: 'cyan' | 'indigo' | 'amber' | 'emerald'
  extra?: { used: number; total: number }
  footnote?: string
}

const colorMap = {
  cyan: {
    bg: "bg-cyan-500/10",
    icon: "text-cyan-500",
    bar: "bg-cyan-500",
    track: "bg-cyan-100",
    value: "text-cyan-600",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    icon: "text-indigo-500",
    bar: "bg-indigo-500",
    track: "bg-indigo-100",
    value: "text-foreground",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "text-amber-500",
    bar: "bg-amber-500",
    track: "bg-amber-100",
    value: "text-amber-600",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    bar: "bg-emerald-500",
    track: "bg-emerald-100",
    value: "text-emerald-600",
  },
}

export function SummaryCards({ snapshot }: { snapshot: DashboardSnapshot }) {
  const latestGroup = snapshot.latestGroup
  const payments = latestGroup?.payments ?? []
  const seats = latestGroup?.seats ?? []
  const members = latestGroup?.members ?? []
  const paidAmount = payments.reduce((acc, payment) => acc + Number(payment.amount), 0)
  const occupiedSeats = seats.filter((seat) => seat.status !== 'free').length
  const overduePayments = payments.filter((payment) => payment.status === 'overdue').length
  const activeTools = Array.from(new Set(seats.map((seat) => `${seat.tool.name}::${seat.tool.provider}`))).length

  const cards: SummaryCard[] = [
    {
      title: 'Gasto acumulado',
      value: `$${paidAmount.toFixed(2)}`,
      sub: 'Suma de pagos persistidos en el snapshot.',
      icon: DollarSign,
      color: 'cyan',
    },
    {
      title: 'Asientos ocupados',
      value: `${occupiedSeats}/${seats.length || 1}`,
      sub: 'Estado real de ocupación por herramienta.',
      icon: Layers,
      color: 'indigo',
      extra: { used: occupiedSeats, total: seats.length || 1 },
      footnote: seats.length ? `${seats.length - occupiedSeats} libres de ${seats.length}` : 'No hay asientos cargados',
    },
    {
      title: 'Miembros activos',
      value: `${members.length}`,
      sub: 'Usuarios vinculados al último grupo.',
      icon: Users,
      color: 'emerald',
    },
    {
      title: 'Pagos en mora',
      value: `${overduePayments}`,
      sub: 'Alertas que disparan el banner de riesgo.',
      icon: CalendarClock,
      color: overduePayments > 0 ? 'amber' : 'cyan',
      extra: overduePayments > 0 ? { used: overduePayments, total: payments.length || 1 } : undefined,
      footnote: overduePayments > 0 ? 'Necesita seguimiento inmediato' : `${activeTools} herramientas activas`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const colors = colorMap[card.color as keyof typeof colorMap]
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-xl p-2.5 ${colors.bg}`}>
                <card.icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              {card.title === 'Pagos en mora' && overduePayments > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Riesgo
                </span>
              )}
            </div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">{card.title}</p>
            <p className={`text-2xl font-bold leading-tight ${colors.value}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>

            {card.extra && (
              <div className="mt-3">
                <div className={`h-1.5 w-full rounded-full ${colors.track}`}>
                  <div
                    className={`h-1.5 rounded-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${(card.extra.used / card.extra.total) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {card.footnote ?? `${card.extra.total - card.extra.used} libres de ${card.extra.total}`}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
