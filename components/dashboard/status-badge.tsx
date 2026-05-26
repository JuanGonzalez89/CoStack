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
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
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