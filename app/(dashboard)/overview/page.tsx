import type { DashboardSnapshot } from '@/lib/dashboard-snapshot'
import { AlertTriangle, Bell, Bot, Box } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ToolCards } from '@/components/dashboard/tool-cards'
import { BotLog, type LogEntry } from '@/components/dashboard/bot-log'
import { PaymentTraffic } from '@/components/dashboard/payment-traffic'
import { SeatAccessCard } from '@/components/dashboard/seat-access-card'
import { OnboardingPrompt } from '@/components/dashboard/onboarding-prompt'
import type { ToolCardData } from '@/features/dashboard/contracts'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'
import { authOptions } from '@/lib/auth'
import { ROUTES } from '@/lib/constants/routes'
import { resolvePostAuthPath } from '@/lib/user-journey.server'
import Link from 'next/link'

export default async function OverviewPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    const targetPath = await resolvePostAuthPath(session.user.email)
    if (targetPath === ROUTES.start) {
      redirect(targetPath)
    }
  }

  const snapshot = await getDashboardSnapshot()
  const botEntries = formatBotEntries(snapshot)
  const overduePayments = snapshot.latestGroup?.payments.filter((payment) => payment.status === 'overdue') ?? []
  const tools = buildToolCards(snapshot)
  const hasTools = tools.length > 0

  return (
    <div className="space-y-6 bg-[#07111d]">
      <header className="rounded-[30px] border border-slate-800/30 bg-slate-900/70 px-5 py-5 lg:px-6 shadow-[0_10px_30px_rgba(2,6,23,0.6)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              <span>Dashboard</span>
              <span className="text-cyan-500/50">/</span>
              <span>Control operativo</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-50">CoStack en tiempo real</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Accesos, pagos y actividad del grupo en una vista compacta, con foco visual en el estado de cada suscripción.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full animate-pulse bg-cyan-300" />
              <Bot size={13} className="text-cyan-300" />
              <span className="text-xs font-semibold text-cyan-100">Bot Online</span>
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10">
              <Bell size={16} className="text-cyan-100/70" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {overduePayments.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/12 to-amber-500/6 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Alerta de mora</p>
                <h2 className="mt-1 text-lg font-semibold text-amber-50">Hay pagos vencidos que necesitan seguimiento</h2>
                <p className="mt-1 text-sm text-amber-100/80">
                  {overduePayments.length} {overduePayments.length === 1 ? 'pago está' : 'pagos están'} vencido{overduePayments.length === 1 ? '' : 's'} en el grupo activo.
                </p>
              </div>
            </div>
            <Link href="/billetera" className="inline-flex rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400">
              Revisar billetera
            </Link>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Resumen</p>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Estado del snapshot</h2>
          </div>
        </div>
        <SummaryCards snapshot={snapshot} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)]">
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
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Actividad</p>
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
    const key = seat.tool.slug
    const current = grouped.get(key)
    const seatStatus = seat.status
    const paymentForTool = payments.find((payment) => payment.tool.slug === seat.tool.slug)
    const monthlyCost = Number(seat.tool.monthlyCost ?? paymentForTool?.amount ?? 0)

    if (!current) {
      grouped.set(key, {
        id: seat.tool.slug,
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
    const isPaid = payments.some((payment) => payment.tool.slug === seat.tool.slug && payment.status === 'paid')

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
    <div className="rounded-2xl border border-cyan-500/10 bg-slate-900/70 px-4 py-3">
      <p className="text-xs font-medium text-cyan-100/70">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">{value}</p>
    </div>
  )
}
