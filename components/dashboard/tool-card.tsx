"use client"

import { CreditCard, Loader2, Lock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, type StatusTone } from '@/components/dashboard/status-badge'
import type { ToolCardData, ToolCardState } from '@/features/dashboard/contracts'
import { cn, formatCurrency } from '@/lib/utils'

const statusLabels: Record<ToolCardState, { label: string; tone: StatusTone }> = {
  pending: { label: 'Cuota Pendiente', tone: 'warning' },
  paying: { label: 'Procesando Pago...', tone: 'neutral' },
  assigning: { label: 'Reservando Cupo...', tone: 'neutral' },
  assigned: { label: 'Cupo Confirmado', tone: 'success' },
  lobby: { label: 'Sala de espera', tone: 'neutral' },
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

export function ToolCard({ tool, onRequestPay, onSelect, onOpenLobby, isOrganizer = false }: { tool: ToolCardData; onRequestPay?: (id: string) => void; onSelect?: (tool: ToolCardData) => void; onOpenLobby?: (tool: ToolCardData) => void; isOrganizer?: boolean }) {
  const isPending = tool.status === 'pending'
  const isPaying = tool.status === 'paying'
  const isAssigning = tool.status === 'assigning'
  const isAssigned = tool.status === 'assigned'
  const isLobby = tool.status === 'lobby'
  const isLoading = isPaying || isAssigning
  const badge = statusLabels[tool.status]
  const accent = accentStyles[tool.accent]

  return (
    <article
      onClick={() => {
        if (isAssigned && onSelect) onSelect(tool)
        if (isLobby && onOpenLobby) onOpenLobby(tool)
      }}
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.02] p-6 lg:p-7 transition-all",
        (isAssigned || isLobby) ? "cursor-pointer hover:bg-white/[0.04] hover:border-cyan-500/30" : "hover:bg-white/[0.04]"
      )}
    >
      <div>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold bg-white/5', accent.iconText)}>
              {tool.iconLabel}
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-50">{tool.name}</h3>
              <p className="text-sm text-zinc-400">{tool.provider}</p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight text-zinc-50">${formatCurrency(tool.monthlyCost)}</span>
          <span className="text-sm font-medium text-zinc-500">/mes</span>
        </div>
        
        <div className="mb-6">
          <StatusBadge label={badge.label} tone={badge.tone} />
        </div>
      </div>

      <div className="pt-2">
        {isPending && (
          <Button onClick={() => onRequestPay?.(tool.id)} className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm" size="lg">
            <CreditCard size={18} className="mr-2" />
            {isOrganizer ? "Completar Pago Inicial" : "Pagar Licencia"}
          </Button>
        )}

        {isLoading && (
          <Button disabled className="w-full h-12 rounded-xl bg-white/10 text-white font-bold text-sm" size="lg">
            <Loader2 size={18} className="animate-spin mr-2" />
            Procesando...
          </Button>
        )}

        {isLobby && (
          <Button onClick={() => onOpenLobby?.(tool)} className="w-full h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-sm hover:bg-amber-500/20" size="lg">
            <Users className="w-4 h-4 mr-2" />
            {isOrganizer ? `Esperando miembros (${tool.lobbyFilled ?? 0}/${tool.lobbyTotal ?? 10})` : `Ver sala de espera (${tool.lobbyFilled ?? 0}/${tool.lobbyTotal ?? 10})`}
          </Button>
        )}

        {isAssigned && (
          <Button variant="outline" className="w-full h-12 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/10" size="lg">
            <Lock size={18} className="mr-2" />
            Ver detalle
          </Button>
        )}
      </div>
    </article>
  )
}
