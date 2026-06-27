import type { DashboardSnapshot } from '@/lib/dashboard-snapshot'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ToolCards } from '@/components/dashboard/tool-cards'
import type { ToolCardData } from '@/features/dashboard/contracts'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ROUTES } from '@/lib/constants/routes'
import { resolvePostAuthPath } from '@/lib/user-journey.server'
import { CATALOG } from '@/lib/catalog'


export default async function OverviewPage(props: { searchParams?: Promise<{ lobbyId?: string }> }) {
  const searchParams = await props.searchParams
  const initialLobbyId = searchParams?.lobbyId ?? null

  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    const targetPath = await resolvePostAuthPath(session.user.email)
    if (targetPath !== ROUTES.overview) {
      redirect(targetPath)
    }
  }

  const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? '' } })
  const isOrganizer = user?.role === 'organizer'
  const userId = user?.id ?? ''

  const userEmail = session?.user?.email ?? ''
  let tools: ToolCardData[] = []
  let snapshot: DashboardSnapshot | null = null

  try {
    snapshot = await getDashboardSnapshot(userEmail)
    tools = await buildToolCards(snapshot, userId, userEmail)
  } catch (e) {
    console.error("[overview] buildToolCards failed:", e)
  }

  const hasTools = tools.length > 0

  if (!hasTools && !isOrganizer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto">
            <span className="text-4xl">🔒</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Todavía no tenés licencias</h2>
            <p className="text-zinc-400 leading-relaxed">
              Comprá tu primera herramienta en el catálogo para desbloquear esta pantalla.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/suscripciones" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-colors">
              Ir al catálogo
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/welcome" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white hover:bg-white/5 font-semibold transition-colors">
              Cambiar de rol
            </a>
          </div>
        </div>
      </div>
    )
  }

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
        </div>
      </header>

      {snapshot?._isMock && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-3">
          <span className="text-lg">🟡</span>
          <span><strong>Modo demostración</strong> — los datos mostrados son simulados. Conectá la base de datos para ver información real.</span>
        </div>
      )}

      {!hasTools && !isOrganizer ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center max-w-md space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto">
              <span className="text-4xl">🔒</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Todavía no tenés licencias</h2>
              <p className="text-zinc-400 leading-relaxed">
                Comprá tu primera herramienta en el catálogo para desbloquear esta pantalla.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/suscripciones" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-colors">
                Ir al catálogo
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/welcome" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-300 hover:text-white hover:bg-white/5 font-semibold transition-colors">
                Cambiar de rol
              </a>
            </div>
          </div>
        </div>
      ) : (
        <section className="space-y-6">
          <ToolCards tools={tools} isOrganizer={isOrganizer} initialLobbyId={initialLobbyId} />
        </section>
      )}
    </div>
  )
}

async function buildToolCards(snapshot: DashboardSnapshot, userId: string, userEmail: string): Promise<ToolCardData[]> {
  const groups = snapshot.activeGroups
  const seats = groups.flatMap(g => g.seats ?? [])
  const payments = groups.flatMap(g => g.payments ?? [])
  const userPayments = payments.filter(p => p.user.email === userEmail)
  const grouped = new Map<string, ToolCardData>()

  // Process seats first (old system)
  seats.forEach((seat, index) => {
    const key = seat.tool.slug
    const current = grouped.get(key)
    const seatStatus = seat.status
    const paymentForTool = userPayments.find((payment) => payment.tool.slug === seat.tool.slug)
    const monthlyCost = Number(paymentForTool?.amount ?? seat.tool.monthlyCost ?? 0)
    const catalogEntry = CATALOG.find((c) => c.id === key)

    if (!current) {
      grouped.set(key, {
        id: seat.tool.slug,
        name: seat.tool.name,
        provider: seat.tool.provider,
        providerUrl: catalogEntry?.providerUrl,
        monthlyCost,
        seatsUsed: seatStatus === 'free' ? 0 : 1,
        seatsTotal: 1,
        status: paymentForTool?.status === 'paid' && seatStatus !== 'pending' ? 'assigned' : 'pending',
        accent: ['cyan', 'violet', 'orange'][index % 3] as ToolCardData['accent'],
        iconLabel: seat.tool.name.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 3),
        accessToken: seat.accessToken,
      })
      return
    }

    const nextSeatsUsed = seatStatus === 'free' ? current.seatsUsed : current.seatsUsed + 1
    const nextSeatsTotal = current.seatsTotal + 1
    const isPaid = paymentForTool?.status === 'paid' && seatStatus !== 'pending'

    grouped.set(key, {
      ...current,
      monthlyCost: monthlyCost || current.monthlyCost,
      seatsUsed: nextSeatsUsed,
      seatsTotal: nextSeatsTotal,
      status: isPaid ? 'assigned' : 'pending',
      accessToken: current.accessToken || seat.accessToken,
    })
  })

  // Then process lobbies (new system — overrides seats for the same tool)
  try {
    const userLobbies = await prisma.lobby.findMany({
      where: { members: { some: { userId } } },
      include: { members: { where: { userId }, take: 1 } },
    })

    for (const lobby of userLobbies) {
      const catalogEntry = CATALOG.find((c) => c.id === lobby.toolSlug)
      let memberCount = 0
      try { memberCount = await prisma.lobbyMember.count({ where: { lobbyId: lobby.id } }) } catch { /* */ }

      grouped.set(lobby.toolSlug, {
        id: lobby.toolSlug,
        name: lobby.toolName,
        provider: lobby.provider,
        monthlyCost: Number(lobby.pricePerSeat),
        seatsUsed: 1,
        seatsTotal: lobby.totalSeats,
        status: lobby.status === 'completed' ? 'assigned' : lobby.status === 'expired' ? 'pending' : 'lobby',
        accent: ['cyan', 'violet', 'orange'][grouped.size % 3] as ToolCardData['accent'],
        iconLabel: lobby.toolName.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 3),
        accessToken: lobby.accessToken,
        accessMethod: lobby.accessMethod,
        providerUrl: catalogEntry?.providerUrl,
        lobbyId: lobby.status === 'waiting' || lobby.status === 'processing' ? lobby.id : undefined,
        lobbyFilled: lobby.status === 'waiting' || lobby.status === 'processing' ? memberCount : undefined,
        lobbyTotal: lobby.totalSeats,
      })
    }
  } catch { /* lobby table may not exist */ }

  return Array.from(grouped.values())
}
