import { CheckCircle2, Clock3, AlertCircle, Minus } from 'lucide-react'
import type { StatusBadgeStatus } from '@/features/dashboard/contracts'
import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

const statusToTone: Record<StatusBadgeStatus, StatusTone> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
  idle: 'neutral',
  blocked: 'danger',
}

const statusLabels: Record<StatusBadgeStatus, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Vencido',
  idle: 'Sin actividad',
  blocked: 'Bloqueado',
}

const toneStyles: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-500 border-red-500/20',
  neutral: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50',
}

const toneIcons: Record<StatusTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: Clock3,
  danger: AlertCircle,
  neutral: Minus,
}

interface StatusBadgeProps {
  label?: string
  status?: StatusBadgeStatus
  tone?: StatusTone
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ label, status, tone, size = 'sm', className }: StatusBadgeProps) {
  const resolvedTone = tone ?? (status ? statusToTone[status] : 'neutral')
  const resolvedLabel = label ?? (status ? statusLabels[status] : 'Sin estado')
  const Icon = toneIcons[resolvedTone]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
        ,
        toneStyles[resolvedTone],
        className,
      )}
    >
      <Icon size={11} />
      {resolvedLabel}
    </span>
  )
}