import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyStateVariant = 'default' | 'action'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  variant?: EmptyStateVariant
  cta?: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = 'default',
  cta,
  secondaryCta,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center shadow-sm', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-xl font-bold text-zinc-50">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">{description}</p>

      {variant === 'action' && cta && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-xl bg-sky-500 text-white hover:bg-sky-400">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
          {secondaryCta && (
            <Button asChild variant="outline" className="rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}