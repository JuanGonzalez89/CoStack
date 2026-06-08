"use client"

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/lib/constants/routes'

type JourneyMode = 'login' | 'register'

interface AuthJourneyFormProps {
  mode: JourneyMode
  title: string
  description: string
  submitLabel: string
}

const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña necesita al menos 8 caracteres'),
})

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Escribí tu nombre'),
})

type AuthFormState = {
  name: string
  email: string
  password: string
}

const initialFormState: AuthFormState = {
  name: '',
  email: '',
  password: '',
}

function resolveSuccessPath() {
  return ROUTES.suscripciones
}

export function AuthJourneyForm({ mode, title, description, submitLabel }: AuthJourneyFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<AuthFormState>(initialFormState)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function patchForm(patch: Partial<AuthFormState>) {
    setForm((current) => ({ ...current, ...patch }))
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        const parsed = loginSchema.safeParse({ email: form.email, password: form.password })

        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Revisá los campos del formulario.')
          return
        }

        const result = await signIn('credentials', {
          redirect: false,
          email: parsed.data.email,
          password: parsed.data.password,
          callbackUrl: ROUTES.suscripciones,
        })

        if (result?.error) {
          setErrorMessage('No pudimos iniciar sesión. Verificá email y contraseña.')
          return
        }

        router.replace(resolveSuccessPath())
        router.refresh()
        return
      }

      if (mode === 'register') {
        const parsed = registerSchema.safeParse({
          name: form.name,
          email: form.email,
          password: form.password,
        })

        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Revisá los campos del formulario.')
          return
        }

        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed.data),
        })

        if (!registerResponse.ok) {
          const payload = (await registerResponse.json().catch(() => null)) as { error?: string } | null
          setErrorMessage(payload?.error ?? 'No pudimos crear la cuenta. Revisá los datos e intentá de nuevo.')
          return
        }

        const result = await signIn('credentials', {
          redirect: false,
          email: parsed.data.email,
          password: parsed.data.password,
          callbackUrl: ROUTES.suscripciones,
        })

        if (result?.error) {
          const serverError = result.error
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[auth] signIn error:', serverError)
          }
          setErrorMessage(
            process.env.NODE_ENV !== 'production' ? `La cuenta se creó, pero no pudimos iniciar sesión: ${serverError}` : 'No pudimos iniciar sesión. Intentá nuevamente.'
          )
          return
        }

        router.replace(resolveSuccessPath())
        router.refresh()
        return
        // Onboarding form handler removed.
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-5 rounded-[28px] border border-zinc-800/80 bg-zinc-900/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur lg:p-7">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Acceso seguro</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">{title}</h1>
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
      </div>

      <div className="space-y-4">
        {mode === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" value={form.name} onChange={(event) => patchForm({ name: event.target.value })} placeholder="Martín Pérez" />
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => patchForm({ email: event.target.value })} placeholder="martin@costack.app" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => patchForm({ password: event.target.value })} placeholder="••••••••" />
            </div>
          </>
        )}

      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <Button type="submit" className="w-full rounded-xl bg-cyan-500 text-white hover:bg-cyan-400" disabled={isSubmitting}>
        {isSubmitting ? 'Procesando...' : submitLabel}
      </Button>
    </form>
  )
}