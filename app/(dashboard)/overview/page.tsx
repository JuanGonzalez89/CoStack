"use client"

import { useCallback, useState } from 'react'
import { Bell, Bot } from 'lucide-react'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ToolCards } from '@/components/dashboard/tool-cards'
import { BotLog, type LogEntry } from '@/components/dashboard/bot-log'
import { PaymentTraffic } from '@/components/dashboard/payment-traffic'
import { now } from '@/lib/utils'

export default function OverviewPage() {
  const [extraLogs, setExtraLogs] = useState<LogEntry[]>([])

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

      <SummaryCards />
      <ToolCards onBotLog={handleBotLog} />
      <PaymentTraffic />
      <BotLog extraLogs={extraLogs} />
    </div>
  )
}