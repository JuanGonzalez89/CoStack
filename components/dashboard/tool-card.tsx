"use client"

import { Bot, CreditCard, Loader2, Lock, MessageSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, type StatusTone } from '@/components/dashboard/status-badge'
import type { ToolCardData, ToolCardState } from '@/features/dashboard/contracts'
import { cn } from '@/lib/utils'

const statusLabels: Record<ToolCardState, { label: string; tone: StatusTone }> = {
  pending: { label: 'Cuota Pendiente', tone: 'warning' },
  paying: { label: 'Procesando Pago...', tone: 'neutral' },
  assigning: { label: 'Asignando Asiento...', tone: 'neutral' },
  assigned: { label: 'Asiento Asignado', tone: 'success' },
}

const accentStyles: Record<ToolCardData['accent'], { stripe: string; iconBg: string; iconText: string }> = {
  orange: { stripe: 'bg-amber-500', iconBg: 'bg-amber-500/10', iconText: 'text-amber-500' },
  violet: { stripe: 'bg-violet-500', iconBg: 'bg-violet-500/10', iconText: 'text-violet-500' },
  cyan: { stripe: 'bg-sky-500', iconBg: 'bg-sky-500/10', iconText: 'text-sky-500' },
}

function SeatDots({ used, total }: { used: number; total: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-2.5 w-2.5 rounded-full border transition-all duration-300',
            index < used ? 'border-sky-500 bg-sky-500' : 'border-zinc-800 bg-transparent',
          )}
        />
      ))}
    </div>
  )
}

export function ToolCard({ tool, onRequestPay }: { tool: ToolCardData; onRequestPay: (id: string) => void }) {
  const isPending = tool.status === 'pending'
  const isPaying = tool.status === 'paying'
  const isAssigning = tool.status === 'assigning'
  const isAssigned = tool.status === 'assigned'
  const isLoading = isPaying || isAssigning
  const badge = statusLabels[tool.status]
  const accent = accentStyles[tool.accent]

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-700',
        isPending ? 'border-amber-500/20' : 'border-zinc-800',
        isLoading && 'border-sky-500/20',
        isAssigned && 'border-emerald-500/20',
      )}
    >
      <div className={cn('h-1 w-full', accent.stripe)} />

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold border border-zinc-800', accent.iconBg, accent.iconText)}>
              {tool.iconLabel}
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight text-zinc-50">{tool.name}</h3>
              <p className="text-xs text-zinc-400">{tool.provider}</p>
            </div>
          </div>

          <StatusBadge label={badge.label} tone={badge.tone} />
        </div>

        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-50">${tool.monthlyCost}</span>
          <span className="text-xs text-zinc-500">/mes por asiento</span>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Users size={12} />
              Asientos ocupados
            </span>
            <span className="text-xs font-semibold text-zinc-50">
              {tool.seatsUsed}/{tool.seatsTotal}
            </span>
          </div>
          <SeatDots used={tool.seatsUsed} total={tool.seatsTotal} />
        </div>

        {isAssigned && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <Bot size={14} className="shrink-0 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-400">OpenClaw Bot envió link de invitación por DM</span>
            <MessageSquare size={12} className="ml-auto shrink-0 text-emerald-500" />
          </div>
        )}

        <div className="mb-4 border-t border-zinc-800" />

        {isPending && (
          <Button onClick={() => onRequestPay(tool.id)} className="w-full rounded-xl bg-sky-500 font-semibold text-white hover:bg-sky-400" size="sm">
            <CreditCard size={14} />
            Pagar ${tool.monthlyCost} y Asignar Asiento
          </Button>
        )}

        {isLoading && (
          <Button disabled className="w-full cursor-not-allowed rounded-xl bg-sky-500/70 font-semibold text-white" size="sm">
            <Loader2 size={14} className="animate-spin" />
            {isPaying ? 'Verificando pago...' : 'Bot asignando asiento...'}
          </Button>
        )}

        {isAssigned && (
          <Button disabled variant="outline" className="w-full cursor-default rounded-xl border-emerald-500/20 bg-emerald-500/10 font-semibold text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500" size="sm">
            <Lock size={14} />
            Pago al día
          </Button>
        )}
      </div>
    </article>
  )
}