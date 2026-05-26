"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import type { GroupState, PaymentState, UserRole } from "@/lib/session"

type JourneyMode = "login" | "register" | "onboarding"

interface DemoSessionFormProps {
  mode: JourneyMode
  title: string
  description: string
  submitLabel: string
  defaultRole?: UserRole
  defaultGroup?: GroupState
  defaultPayment?: PaymentState
  fixedGroup?: GroupState
}

const journeySchema = z.object({
  name: z.string().trim().min(2, "Escribí tu nombre"),
  email: z.string().trim().email("Ingresá un email válido"),
  password: z.string().min(8, "La contraseña necesita al menos 8 caracteres"),
  groupName: z.string().trim().optional(),
  inviteCode: z.string().trim().optional(),
  role: z.enum(["member", "organizer"]),
  group: z.enum(["none", "active"]),
  payment: z.enum(["current", "overdue"]),
})

type FormState = z.infer<typeof journeySchema>

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  groupName: "",
  inviteCode: "",
  role: "member",
  group: "none",
  payment: "current",
}

function getStorageKey(mode: JourneyMode) {
  return `costack-journey-${mode}`
}

function resolveRedirect(group: GroupState, payment: PaymentState) {
  if (payment === "overdue") {
    return ROUTES.overdue
  }

  return group === "active" ? ROUTES.overview : ROUTES.onboarding
}

export function DemoSessionForm({
  mode,
  title,
  description,
  submitLabel,
  defaultRole = "member",
  defaultGroup = "none",
  defaultPayment = "current",
  fixedGroup,
}: DemoSessionFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>({
    ...initialFormState,
    role: defaultRole,
    group: defaultGroup,
    payment: defaultPayment,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const raw = window.sessionStorage.getItem(getStorageKey(mode))
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as Partial<FormState> & { step?: 1 | 2 }
      setForm((current) => ({
        ...current,
        ...parsed,
        role: parsed.role ?? current.role,
        group: parsed.group ?? current.group,
        payment: parsed.payment ?? current.payment,
      }))

      if (parsed.step === 2) {
        setStep(2)
      }
    } catch {
      window.sessionStorage.removeItem(getStorageKey(mode))
    }
  }, [mode])

  useEffect(() => {
    window.sessionStorage.setItem(getStorageKey(mode), JSON.stringify({ ...form, step }))
  }, [form, mode, step])

  const stepOneSchema =
    mode === "login"
      ? z.object({
          email: journeySchema.shape.email,
          password: journeySchema.shape.password,
        })
      : mode === "register"
      ? z.object({
          name: journeySchema.shape.name,
          email: journeySchema.shape.email,
          password: journeySchema.shape.password,
          groupName: z.string().trim().min(2, "Definí el nombre del grupo"),
        })
      : z.object({
          groupName: z.string().trim().min(2, "Definí el nombre del grupo"),
          inviteCode: z.string().trim().optional(),
        })

  const stepTwoSchema = z.object({
    role: journeySchema.shape.role,
    group: journeySchema.shape.group,
    payment: journeySchema.shape.payment,
  })

  function patchForm(patch: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patch }))
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const result = stepOneSchema.safeParse(
      mode === "login"
        ? { email: form.email, password: form.password }
        : mode === "register"
        ? { name: form.name, email: form.email, password: form.password, groupName: form.groupName }
        : { groupName: form.groupName, inviteCode: form.inviteCode },
    )

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? "Revisá los campos del paso actual.")
      return
    }

    setStep(2)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const result = stepTwoSchema.safeParse({
      role: form.role,
      group: fixedGroup ?? form.group,
      payment: form.payment,
    })

    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? "Revisá la configuración de acceso.")
      return
    }

    if (fixedGroup !== "active" && mode !== "login" && !form.groupName?.trim()) {
      setErrorMessage("Definí un grupo antes de continuar.")
      return
    }

    setIsSubmitting(true)

    const group = fixedGroup ?? (form.groupName?.trim() || form.inviteCode?.trim() ? "active" : form.group)
    const response = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: form.role,
        group,
        payment: form.payment,
      }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage("No pudimos guardar la sesión de demo.")
      return
    }

    window.sessionStorage.removeItem(getStorageKey(mode))
    router.push(resolveRedirect(group, form.payment))
    router.refresh()
  }

  const currentGroup = fixedGroup ?? form.group
  const stepLabel = step === 1 ? "Paso 1 de 2" : "Paso 2 de 2"

  return (
    <form
      onSubmit={step === 1 ? handleNext : handleSubmit}
      className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
            {stepLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span className={step === 1 ? "text-cyan-600" : "text-muted-foreground"}>Identidad</span>
        <span>•</span>
        <span className={step === 2 ? "text-cyan-600" : "text-muted-foreground"}>Acceso</span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          {mode === "register" && (
            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Nombre completo</span>
              <input
                value={form.name}
                onChange={(event) => patchForm({ name: event.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                placeholder="Martín Pérez"
              />
            </label>
          )}

          {(mode === "login" || mode === "register") && (
            <>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Email</span>
                <input
                  value={form.email}
                  onChange={(event) => patchForm({ email: event.target.value })}
                  type="email"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="martin@costack.app"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Contraseña</span>
                <input
                  value={form.password}
                  onChange={(event) => patchForm({ password: event.target.value })}
                  type="password"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="••••••••"
                />
              </label>
            </>
          )}

          {mode === "onboarding" && (
            <>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Nombre del grupo</span>
                <input
                  value={form.groupName ?? ""}
                  onChange={(event) => patchForm({ groupName: event.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="CoStack Studio"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Código de invitación</span>
                <input
                  value={form.inviteCode ?? ""}
                  onChange={(event) => patchForm({ inviteCode: event.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="Opcional: COSTACK-84A2"
                />
              </label>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Rol</span>
              <select
                value={form.role}
                onChange={(event) => patchForm({ role: event.target.value as UserRole })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="member">Miembro</option>
                <option value="organizer">Organizador</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Estado de grupo</span>
              <select
                value={currentGroup}
                onChange={(event) => patchForm({ group: event.target.value as GroupState })}
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
                value={form.payment}
                onChange={(event) => patchForm({ payment: event.target.value as PaymentState })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="current">Al día</option>
                <option value="overdue">Moroso</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resumen</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm font-semibold text-foreground">{form.name || "Pendiente"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Grupo</p>
                <p className="text-sm font-semibold text-foreground">{form.groupName?.trim() || "Sin definir"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="text-sm font-semibold text-foreground">
                  {form.payment === "overdue" ? "Billetera con bloqueo" : "Dashboard"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        {step === 2 && (
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
            Volver
          </Button>
        )}

        <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : step === 1 ? "Continuar" : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export { DemoSessionForm as OnboardingWizard }