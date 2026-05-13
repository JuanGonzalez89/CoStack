import { DollarSign, Layers, CalendarClock } from "lucide-react"

const cards = [
  {
    title: "Inversión Mensual",
    value: "$150.00",
    sub: "Ciclo Mayo 2026",
    icon: DollarSign,
    color: "cyan",
    extra: null,
    footnote: null,
  },
  {
    title: "Licencias en Uso",
    value: "3 Activas",
    sub: "ChatGPT · Figma · Canva",
    icon: Layers,
    color: "indigo",
    extra: { used: 3, total: 5 },
    footnote: "de 5 licencias suscritas",
  },
  {
    title: "Próximo Vencimiento",
    value: "5 Días",
    sub: "Renovación: 18 May 2026",
    icon: CalendarClock,
    color: "amber",
    extra: null,
    footnote: null,
  },
]

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
}

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const colors = colorMap[card.color as keyof typeof colorMap]
        return (
          <div
            key={card.title}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${colors.bg}`}>
                <card.icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{card.title}</p>
            <p className={`text-2xl font-bold leading-tight ${colors.value}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>

            {card.extra && (
              <div className="mt-3">
                <div className={`w-full h-1.5 rounded-full ${colors.track}`}>
                  <div
                    className={`h-1.5 rounded-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${(card.extra.used / card.extra.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
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
