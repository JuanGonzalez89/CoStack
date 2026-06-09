import type { DashboardSnapshot } from '@/lib/dashboard-snapshot'
import { AlertTriangle, Bell, Bot, Box, ShieldCheck } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ToolCards } from '@/components/dashboard/tool-cards'
import { BotLog, type LogEntry } from '@/components/dashboard/bot-log'
import { PaymentTraffic } from '@/components/dashboard/payment-traffic'
import { SeatAccessCard } from '@/components/dashboard/seat-access-card'
import { SuccessAccessCard } from '@/components/dashboard/success-access-card'
import { PaymentRetryBanner } from '@/components/dashboard/payment-retry-banner'
import { OnboardingPrompt } from '@/components/dashboard/onboarding-prompt'
import type { ToolCardData } from '@/features/dashboard/contracts'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/lib/constants/routes'
import { resolvePostAuthPath } from '@/lib/user-journey.server'
import Link from 'next/link'

export default async function OverviewPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    const targetPath = await resolvePostAuthPath(session.user.email)
    if (targetPath !== ROUTES.overview) {
      redirect(targetPath)
    }
  }

  const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? '' } })
  const isOrganizer = user?.role === 'organizer'

  const snapshot = await getDashboardSnapshot()
  const botEntries = formatBotEntries(snapshot)
  const overduePayments = snapshot.latestGroup?.payments.filter((payment) => payment.status === 'overdue') ?? []
  const tools = buildToolCards(snapshot)
  const hasTools = tools.length > 0

  return (
    <div className="space-y-6 bg-zinc-950">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-cyan-400 mb-2">
            <span>{isOrganizer ? 'Vista de Organizador' : 'Tu Suscripción'}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {isOrganizer ? 'CoStack Studio' : 'Tus Herramientas'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl">
            {isOrganizer
              ? 'Administrá el acceso, pagos y el estado general de tu espacio de trabajo.'
              : 'Accedé a tus licencias y gestioná tus herramientas desde aquí.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5 backdrop-blur-md">
            <span className={`h-1.5 w-1.5 rounded-full ${isOrganizer ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-xs font-medium text-zinc-300">
              {isOrganizer ? 'Sistema activo' : 'Acceso garantizado'}
            </span>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white transition-colors">
            <Bell size={16} />
          </button>
        </div>
      </header>

      {isOrganizer && overduePayments.length > 0 && (
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
                  {overduePayments.length} {overduePayments.length === 1 ? 'pago está' : 'pagos están'} vencido{overduePayments.length === 1 ? '' : 's'} en el espacio activo.
                </p>
              </div>
            </div>
            <Link href="/billetera" className="inline-flex rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400">
              Revisar billetera
            </Link>
          </div>
        </div>
      )}

      {!isOrganizer && overduePayments.length > 0 && (
        <PaymentRetryBanner 
          title="Tu acceso está suspendido por falta de pago"
          description="Abona tu cuota mensual para reactivar el acceso inmediatamente."
          href="/billetera"
        />
      )}

      {isOrganizer && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Resumen</p>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Estado operativo</h2>
            </div>
          </div>
          <SummaryCards snapshot={snapshot} isOrganizer={isOrganizer} />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)]">
        <div className="space-y-6">
          {hasTools ? (
            <ToolCards tools={tools} isOrganizer={isOrganizer} />
          ) : (
            <OnboardingPrompt isOrganizer={isOrganizer} />
          )}

          {isOrganizer && <PaymentTraffic />}
        </div>

        <div className="space-y-6">
          {isOrganizer ? (
            <SeatAccessCard 
              accessState="current" 
              groupName={snapshot.latestGroup?.name ?? 'CoStack Studio'} 
              accessToken={snapshot.latestGroup?.inviteCode ?? 'COSTACK-84A2'} 
            />
          ) : (
            <SuccessAccessCard 
              seatId={snapshot.latestGroup?.seats[0]?.id}
              accessState="current" 
              groupName={snapshot.latestGroup?.name ?? 'CoStack Studio'} 
              accessToken={snapshot.latestGroup?.seats[0]?.accessToken ?? 'COSTACK-84A2-2B22'}
              isBusiness={snapshot.latestGroup?.seats[0]?.tool?.slug === 'figma'} // Simulamos que figma es business temporalmente hasta tener el backend
            />
          )}
        </div>
      </section>

      {isOrganizer && (
        <section className="pt-8">
          <BotLog entries={botEntries} limit={5} />
        </section>
      )}
    </div>
  )
}

function formatBotEntries(snapshot: DashboardSnapshot): LogEntry[] {
  return snapshot.latestGroup?.botEvents?.map((event) => ({
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
