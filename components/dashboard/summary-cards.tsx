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
    bg: "bg-cyan-400/10",
    icon: "text-cyan-300",
    bar: "bg-cyan-400",
    track: "bg-cyan-500/15",
    value: "text-cyan-100",
  },
  indigo: {
    bg: "bg-sky-400/10",
    icon: "text-sky-300",
    bar: "bg-sky-400",
    track: "bg-sky-500/15",
    value: "text-zinc-50",
  },
  amber: {
    bg: "bg-amber-400/10",
    icon: "text-amber-300",
    bar: "bg-amber-400",
    track: "bg-amber-500/15",
    value: "text-amber-200",
  },
  emerald: {
    bg: "bg-emerald-400/10",
    icon: "text-emerald-300",
    bar: "bg-emerald-400",
    track: "bg-emerald-500/15",
    value: "text-emerald-200",
  },
}

export function SummaryCards({ snapshot, isOrganizer = true }: { snapshot: DashboardSnapshot, isOrganizer?: boolean }) {
  const latestGroup = snapshot.latestGroup
  const payments = latestGroup?.payments ?? []
  const seats = latestGroup?.seats ?? []
  const members = latestGroup?.members ?? []
  
  const paidAmount = payments.reduce((acc, payment) => acc + Number(payment.amount), 0)
  const occupiedSeats = seats.filter((seat) => seat.status !== 'free').length
  const overduePayments = payments.filter((payment) => payment.status === 'overdue').length
  const activeTools = Array.from(new Set(seats.map((seat) => `${seat.tool.name}::${seat.tool.provider}`))).length

  // B2C Metrics
  const activeLicenses = seats.filter((seat) => seat.status === 'assigned').length // Simplificado
  // Suma del ahorro: marketPrice - monthlyCost para las licencias asignadas (o pendientes/pagadas)
  const totalSavings = seats.reduce((acc, seat) => {
    if (seat.status !== 'free' && seat.tool.marketPrice) {
      return acc + (Number(seat.tool.marketPrice) - Number(seat.tool.monthlyCost))
    }
    return acc
  }, 0)

  const b2cCards: SummaryCard[] = [
    {
      title: 'Tus Licencias',
      value: `${activeLicenses}`,
      sub: 'Herramientas listas para usar.',
      icon: Layers,
      color: 'cyan',
    },
    {
      title: 'Ahorro Mensual',
      value: `$${totalSavings.toFixed(2)}`,
      sub: 'Lo que no estás pagándole a corporaciones.',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Próximo Vencimiento',
      value: 'En 14 días', // Mock B2C
      sub: 'Renovación automática segura.',
      icon: CalendarClock,
      color: 'indigo',
    }
  ]

  const organizerCards: SummaryCard[] = [
    {
      title: 'Gasto operativo',
      value: `$${paidAmount.toFixed(2)}`,
      sub: 'Suma de pagos del grupo activo.',
      icon: DollarSign,
      color: 'cyan',
    },
    {
      title: 'Cupos ocupados',
      value:
        seats.length === 0
          ? '0/0'
          : seats.length === 1
            ? occupiedSeats === 1
              ? 'Completo'
              : 'Disponible'
            : `${occupiedSeats}/${seats.length}`,
      sub: 'Estado real de ocupación por herramienta.',
      icon: Layers,
      color: 'indigo',
      extra: seats.length > 0 ? { used: occupiedSeats, total: seats.length } : undefined,
      footnote: seats.length ? `${occupiedSeats} ocupados de ${seats.length}` : 'No hay cupos cargados',
    },
    {
      title: 'Miembros activos',
      value: `${members.length}`,
      sub: 'Usuarios vinculados al grupo activo.',
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

  const cards = isOrganizer ? organizerCards : b2cCards

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isOrganizer ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
      {cards.map((card) => {
        const colors = colorMap[card.color as keyof typeof colorMap]
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/15 hover:bg-white/[0.045]"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-xl p-2.5 ${colors.bg}`}>
                <card.icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              {card.title === 'Pagos en mora' && overduePayments > 0 && (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                  Riesgo
                </span>
              )}
            </div>
            <p className="mb-1 text-xs font-medium text-cyan-100/65">{card.title}</p>
            <p className={`text-2xl font-bold leading-tight ${colors.value}`}>{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.sub}</p>

            {card.extra && (
              <div className="mt-3">
                <div className={`h-1.5 w-full rounded-full ${colors.track}`}>
                  <div
                    className={`h-1.5 rounded-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${(card.extra.used / card.extra.total) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
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
