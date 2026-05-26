"use client"

import { useCallback, useState } from 'react'
import { Bell, Bot } from 'lucide-react'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ToolCards } from '@/components/dashboard/tool-cards'
import { BotLog, type LogEntry } from '@/components/dashboard/bot-log'
import { PaymentTraffic } from '@/components/dashboard/payment-traffic'
import { SeatAccessCard } from '@/components/dashboard/seat-access-card'
import { now } from '@/lib/utils'
import { useDashboardSnapshot } from '@/components/dashboard/use-dashboard-snapshot'

export default function OverviewPage() {
  const [extraLogs, setExtraLogs] = useState<LogEntry[]>([])
  const { data: snapshot, isLoading, error } = useDashboardSnapshot()

  const handleBotLog = useCallback((message: string) => {
    setExtraLogs((prev) => [
      ...prev,
      {
        time: now(),
        message,
        type: message.startsWith('[BOT]') ? 'action' : message.startsWith('Pago recibido') ? 'success' : 'info',
      },
    ])
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Gestión de licencias</h1>
          <p className="text-sm text-muted-foreground">Sprint 1: shell de dashboard y estado de bot desacoplado del router.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Bot size={13} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Bot OpenClaw: Online</span>
          </div>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-muted">
            <Bell size={16} className="text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-card bg-cyan-500" />
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">Datos persistidos</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Snapshot de Prisma</h2>
          {isLoading && <p className="mt-2 text-sm text-muted-foreground">Cargando datos persistidos...</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Grupos" value={snapshot?.totals.groups ?? 0} />
            <Metric label="Miembros" value={snapshot?.totals.memberships ?? 0} />
            <Metric label="Pagos" value={snapshot?.totals.payments ?? 0} />
            <Metric label="Asientos" value={snapshot?.totals.seats ?? 0} />
            <Metric label="Posts" value={snapshot?.totals.posts ?? 0} />
            <Metric label="Eventos bot" value={snapshot?.totals.botEvents ?? 0} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">Último grupo</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{snapshot?.latestGroup?.name ?? 'Sin datos cargados'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {snapshot?.latestGroup?.inviteCode ? `Invitación ${snapshot.latestGroup.inviteCode}` : 'Ejecutá el seed para poblar el dashboard.'}
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-muted-foreground">
              Miembros: <span className="font-semibold text-foreground">{snapshot?.latestGroup?.members.length ?? 0}</span>
            </p>
            <p className="text-muted-foreground">
              Herramientas: <span className="font-semibold text-foreground">{snapshot?.latestGroup?.seats.length ?? 0}</span>
            </p>
          </div>
        </div>
      </section>

      <SummaryCards />
      <SeatAccessCard
        accessState="current"
        groupName="CoStack Studio"
        accessToken="COSTACK-74A2-9X11"
      />
      <ToolCards onBotLog={handleBotLog} />
      <PaymentTraffic />
      <BotLog extraLogs={extraLogs} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}