import { CalendarClock, DollarSign, Layers, Users, Box } from 'lucide-react'
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
  const groups = snapshot.activeGroups ?? []
  const payments = groups.flatMap((g) => g.payments)
  const seats = groups.flatMap((g) => g.seats)
  const memberMap = new Map<string, (typeof groups)[number]['members'][number]>()
  for (const g of groups) {
    for (const m of g.members) {
      memberMap.set(m.user.email, m)
    }
  }
  const members = [...memberMap.values()]

  const paidAmount = payments.reduce((acc, payment) => acc + Number(payment.amount), 0)
  const occupiedSeats = seats.filter((seat) => seat.status !== 'free').length
  const activeTools = Array.from(new Set(seats.map((seat) => `${seat.tool.name}::${seat.tool.provider}`))).length

  // B2C Metrics
  const activeLicenses = seats.filter((seat) => seat.status === 'assigned').length
  const totalSavings = seats.reduce((acc, seat) => {
    if (seat.status !== 'free' && (seat.tool as any).marketPrice) {
      return acc + (Number((seat.tool as any).marketPrice) - Number(seat.tool.monthlyCost))
    }
    return acc
  }, 0)

  const b2cCards: SummaryCard[] = [
    {
      title: 'Tus Licencias',
      value: `${activeLicenses}`,
      sub: 'Listas para usar',
      icon: Layers,
      color: 'cyan',
    },
    {
      title: 'Ahorro Mensual',
      value: `$${totalSavings.toFixed(2)}`,
      sub: 'vs Precio oficial',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Próximo Vencimiento',
      value: 'En 14 días',
      sub: 'Renovación automática',
      icon: CalendarClock,
      color: 'indigo',
    }
  ]

  const organizerCards: SummaryCard[] = [
    {
      title: 'Gasto operativo',
      value: `$${paidAmount.toFixed(2)}`,
      sub: 'Mensual estimado',
      icon: DollarSign,
      color: 'cyan',
    },
    {
      title: 'Cupos Activos',
      value: `${occupiedSeats}`,
      sub: `De ${seats.length} cupos totales en el espacio`,
      icon: Layers,
      color: 'indigo',
    },
    {
      title: 'Miembros activos',
      value: `${members.length}`,
      sub: 'Usuarios verificados',
      icon: Users,
      color: 'emerald',
    },
    {
      title: 'Herramientas',
      value: `${activeTools}`,
      sub: 'Gestionadas',
      icon: Box,
      color: 'cyan',
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
            className="flex flex-col justify-between rounded-[24px] bg-transparent border-l-4 border-white/10 pl-6 py-3 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <card.icon className={`h-5 w-5 ${colors.icon}`} />
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{card.title}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-5xl font-bold tracking-tight ${colors.value}`}>{card.value}</p>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
