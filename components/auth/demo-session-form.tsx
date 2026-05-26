"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import type { GroupState, PaymentState, UserRole } from "@/lib/session"

interface DemoSessionFormProps {
  title: string
  description: string
  submitLabel: string
  defaultRole?: UserRole
  defaultGroup?: GroupState
  defaultPayment?: PaymentState
  fixedGroup?: GroupState
}

export function DemoSessionForm({
  title,
  description,
  submitLabel,
  defaultRole = 'member',
  defaultGroup = 'none',
  defaultPayment = 'current',
  fixedGroup,
}: DemoSessionFormProps) {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>(defaultRole)
  const [group, setGroup] = useState<GroupState>(defaultGroup)
  const [payment, setPayment] = useState<PaymentState>(defaultPayment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        group: fixedGroup ?? group,
        payment,
      }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      return
    }

    router.push(fixedGroup === 'active' || group === 'active' ? ROUTES.overview : ROUTES.onboarding)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-foreground">Rol</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="member">Miembro</option>
            <option value="organizer">Organizador</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-foreground">Estado de grupo</span>
          <select
            value={fixedGroup ?? group}
            onChange={(event) => setGroup(event.target.value as GroupState)}
            disabled={Boolean(fixedGroup)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="none">Sin grupo</option>
            <option value="active">Grupo activo</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-foreground">Estado de pago</span>
          <select
            value={payment}
            onChange={(event) => setPayment(event.target.value as PaymentState)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="current">Al día</option>
            <option value="overdue">Moroso</option>
          </select>
        </label>
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? 'Procesando...' : submitLabel}
      </Button>
    </form>
  )
}