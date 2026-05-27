import type { DashboardSnapshot } from '@/lib/dashboard-snapshot'
import { AlertTriangle, Bell, Bot, Box } from 'lucide-react'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ToolCards } from '@/components/dashboard/tool-cards'
import { BotLog, type LogEntry } from '@/components/dashboard/bot-log'
import { PaymentTraffic } from '@/components/dashboard/payment-traffic'
import { SeatAccessCard } from '@/components/dashboard/seat-access-card'
import { OnboardingPrompt } from '@/components/dashboard/onboarding-prompt'
import type { ToolCardData } from '@/features/dashboard/contracts'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'
import Link from 'next/link'

export default async function OverviewPage() {
  const snapshot = await getDashboardSnapshot()
  const botEntries = formatBotEntries(snapshot)
  const overduePayments = snapshot.latestGroup?.payments.filter((payment) => payment.status === 'overdue') ?? []
  const tools = buildToolCards(snapshot)
  const hasTools = tools.length > 0

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-zinc-800 bg-zinc-950 px-5 py-5 shadow-sm lg:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">
              <span>Dashboard</span>
              <span className="text-zinc-600">/</span>
              <span>Control operativo</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Gestión de licencias y acceso</h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                La pantalla prioriza riesgo, métricas, acciones y actividad real para que el estado del equipo se entienda de un vistazo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full animate-pulse bg-emerald-500" />
              <Bot size={13} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-400">Bot Online</span>
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:bg-zinc-800">
              <Bell size={16} className="text-zinc-400" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-zinc-900 bg-sky-500" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniStat label="Grupos" value={snapshot.totals.groups} />
          <MiniStat label="Miembros" value={snapshot.totals.memberships} />
          <MiniStat label="Eventos bot" value={snapshot.totals.botEvents} />
        </div>
      </header>

      {overduePayments.length > 0 && (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Alerta de mora</p>
                <h2 className="mt-1 text-lg font-semibold text-amber-950">Hay pagos vencidos que necesitan seguimiento</h2>
                <p className="mt-1 text-sm text-amber-900/80">
                  {overduePayments.length} {overduePayments.length === 1 ? 'pago está' : 'pagos están'} vencido{overduePayments.length === 1 ? '' : 's'} en el grupo activo.
                </p>
              </div>
            </div>
            <Link href="/billetera" className="inline-flex rounded-xl bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-900">
              Revisar billetera
            </Link>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Resumen</p>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Estado del snapshot</h2>
          </div>
        </div>
        <SummaryCards snapshot={snapshot} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="space-y-6">
          {hasTools ? (
            <ToolCards tools={tools} />
          ) : (
            <OnboardingPrompt />
          )}

          <PaymentTraffic />
        </div>

        <div className="space-y-6">
          <SeatAccessCard accessState="current" groupName={snapshot.latestGroup?.name ?? 'CoStack Studio'} accessToken={snapshot.latestGroup?.seats[0]?.accessToken ?? 'COSTACK-74A2-9X11'} />

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Atajos</p>
                <h3 className="text-base font-semibold tracking-tight text-zinc-50">Funcionalidades principales</h3>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <DashboardLinkCard href="/suscripciones" title="Suscripciones" description="Administrá el catálogo y las cuotas compartidas." />
              <DashboardLinkCard href="/asientos" title="Asientos" description="Revisá ocupación, acceso y acciones por miembro." />
              <DashboardLinkCard href="/comunidad" title="Comunidad" description="Publicaciones, guardados y conexiones del equipo." />
              <DashboardLinkCard href="/billetera" title="Billetera" description="Pagos, saldos y próximos cobros." />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Actividad</p>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Bot log reducido</h2>
        </div>
        <BotLog entries={botEntries} limit={3} />
      </section>
    </div>
  )
}

function formatBotEntries(snapshot: DashboardSnapshot): LogEntry[] {
  return snapshot.latestGroup?.botEvents.map((event) => ({
    time: new Date(event.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    message: event.message,
    type: event.type === 'payment' ? 'success' : event.type === 'error' ? 'action' : 'info',
  })) ?? []
}

function buildToolCards(snapshot: DashboardSnapshot): ToolCardData[] {
  const seats = snapshot.latestGroup?.seats ?? []
  const payments = snapshot.latestGroup?.payments ?? []
  const grouped = new Map<string, ToolCardData>()

  seats.forEach((seat, index) => {
    const key = `${seat.tool.name}::${seat.tool.provider}`
    const current = grouped.get(key)
    const seatStatus = seat.status
    const paymentForTool = payments.find((payment) => payment.tool.name === seat.tool.name)
    const monthlyCost = Number(paymentForTool?.amount ?? 0)

    if (!current) {
      grouped.set(key, {
        id: key,
        name: seat.tool.name,
        provider: seat.tool.provider,
        monthlyCost,
        seatsUsed: seatStatus === 'free' ? 0 : 1,
        seatsTotal: 1,
        status: paymentForTool?.status === 'paid' && seatStatus !== 'pending' ? 'assigned' : 'pending',
        accent: ['cyan', 'violet', 'orange'][index % 3] as ToolCardData['accent'],
        iconLabel: seat.tool.name
          .split(' ')
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? '')
          .join('')
          .slice(0, 3),
      })
      return
    }

    const nextSeatsUsed = seatStatus === 'free' ? current.seatsUsed : current.seatsUsed + 1
    const nextSeatsTotal = current.seatsTotal + 1
    const isPaid = payments.some((payment) => payment.tool.name === seat.tool.name && payment.status === 'paid')

    grouped.set(key, {
      ...current,
      monthlyCost: monthlyCost || current.monthlyCost,
      seatsUsed: nextSeatsUsed,
      seatsTotal: nextSeatsTotal,
      status: isPaid && seatStatus !== 'pending' ? 'assigned' : 'pending',
    })
  })

  return Array.from(grouped.values())
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">{value}</p>
    </div>
  )
}

function DashboardLinkCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800">
      <p className="text-sm font-semibold text-zinc-50">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
    </Link>
  )
}