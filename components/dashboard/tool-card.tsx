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
  orange: { stripe: 'bg-orange-500', iconBg: 'bg-orange-500/10', iconText: 'text-orange-600' },
  violet: { stripe: 'bg-violet-500', iconBg: 'bg-violet-500/10', iconText: 'text-violet-600' },
  cyan: { stripe: 'bg-cyan-500', iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-600' },
}

function SeatDots({ used, total }: { used: number; total: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-2.5 w-2.5 rounded-full border transition-all duration-300',
            index < used ? 'border-cyan-500 bg-cyan-500' : 'border-border bg-transparent',
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
        'overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg',
        isPending && 'border-orange-200 shadow-orange-50',
        isLoading && 'border-cyan-200',
        isAssigned && 'border-emerald-200 shadow-emerald-50',
      )}
    >
      <div className={cn('h-1 w-full', accent.stripe)} />

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold', accent.iconBg, accent.iconText)}>
              {tool.iconLabel}
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight text-foreground">{tool.name}</h3>
              <p className="text-xs text-muted-foreground">{tool.provider}</p>
            </div>
          </div>

          <StatusBadge label={badge.label} tone={badge.tone} />
        </div>

        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">${tool.monthlyCost}</span>
          <span className="text-xs text-muted-foreground">/mes por asiento</span>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users size={12} />
              Asientos ocupados
            </span>
            <span className="text-xs font-semibold text-foreground">
              {tool.seatsUsed}/{tool.seatsTotal}
            </span>
          </div>
          <SeatDots used={tool.seatsUsed} total={tool.seatsTotal} />
        </div>

        {isAssigned && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <Bot size={14} className="shrink-0 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">OpenClaw Bot envió link de invitación por DM</span>
            <MessageSquare size={12} className="ml-auto shrink-0 text-emerald-500" />
          </div>
        )}

        <div className="mb-4 border-t border-border" />

        {isPending && (
          <Button onClick={() => onRequestPay(tool.id)} className="w-full rounded-xl bg-cyan-500 font-semibold text-white hover:bg-cyan-400" size="sm">
            <CreditCard size={14} />
            Pagar ${tool.monthlyCost} y Asignar Asiento
          </Button>
        )}

        {isLoading && (
          <Button disabled className="w-full cursor-not-allowed rounded-xl bg-cyan-500/70 font-semibold text-white" size="sm">
            <Loader2 size={14} className="animate-spin" />
            {isPaying ? 'Verificando pago...' : 'Bot asignando asiento...'}
          </Button>
        )}

        {isAssigned && (
          <Button disabled variant="outline" className="w-full cursor-default rounded-xl border-emerald-300 bg-emerald-50 font-semibold text-emerald-700" size="sm">
            <Lock size={14} />
            Pago al día
          </Button>
        )}
      </div>
    </article>
  )
}