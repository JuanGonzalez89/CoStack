"use client"

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { CreditCard, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ToolCard } from '@/components/dashboard/tool-card'
import type { ToolCardData } from '@/features/dashboard/contracts'
import { EmptyState } from '@/components/dashboard/empty-state'
import { PackageOpen } from 'lucide-react'

const initialTools: ToolCardData[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT Team Workspace',
    provider: 'OpenAI',
    monthlyCost: 30,
    seatsUsed: 4,
    seatsTotal: 5,
    status: 'pending',
    accent: 'orange',
    iconLabel: 'GPT',
  },
  {
    id: 'figma',
    name: 'Figma Organization',
    provider: 'Figma Inc.',
    monthlyCost: 45,
    seatsUsed: 8,
    seatsTotal: 10,
    status: 'assigned',
    accent: 'violet',
    iconLabel: 'FIG',
  },
]

export function ToolCards({ tools: toolsProp }: { tools?: ToolCardData[] }) {
  const router = useRouter()
  const [tools, setTools] = useState(toolsProp ?? initialTools)
  const [pendingPayId, setPendingPayId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toolsProp) {
      setTools(toolsProp)
    }
  }, [toolsProp])

  const pendingTool = tools.find((t) => t.id === pendingPayId)

  const handleRequestPay = (id: string) => {
    setPendingPayId(id)
    setStatusMessage(null)
  }

  const handleConfirmPay = async () => {
    if (!pendingPayId) return

    const id = pendingPayId
    setIsConfirming(true)
    setStatusMessage(null)

    try {
      const response = await fetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolSlug: id }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null

      if (!response.ok) {
        setStatusMessage(payload?.error ?? 'No pudimos procesar el pago demo.')
        return
      }

      setTools((prev) =>
        prev.map((tool) =>
          tool.id === id ? { ...tool, status: 'assigned', seatsUsed: Math.min(tool.seatsTotal, tool.seatsUsed + 1) } : tool,
        ),
      )
      setPendingPayId(null)
      setStatusMessage(payload?.message ?? 'Pago registrado y correo demo enviado.')
      router.refresh()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      {/* Payment confirmation dialog */}
      <Dialog open={!!pendingPayId} onOpenChange={(open) => { if (!open && !isConfirming) setPendingPayId(null) }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Confirmar Pago</DialogTitle>
            <DialogDescription className="text-sm">
              {pendingTool && (
                <>
                  Estás a punto de pagar{" "}
                  <span className="font-semibold text-foreground">${pendingTool.monthlyCost}.00</span>{" "}
                  para reservar cupo en{" "}
                  <span className="font-semibold text-foreground">{pendingTool.name}</span>.
                    Vamos a registrar el pago demo y dejar un correo con el acceso listo.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setPendingPayId(null)}
              disabled={isConfirming}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold gap-2"
              onClick={handleConfirmPay}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  Confirmar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Herramientas</p>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Siguiente paso por suscripción</h2>
            <p className="mt-0.5 text-xs text-slate-300">
              Gestiona tus cupos y continúa el pago desde cada herramienta
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
            {statusMessage}
          </div>
        )}

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onRequestPay={handleRequestPay} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageOpen}
            variant="action"
            title="Todavía no hay herramientas cargadas"
            description="Cuando exista una herramienta activa, las suscripciones y cupos aparecerán acá con una acción clara para continuar."
            cta={{ label: 'Ir al catálogo', href: '/suscripciones' }}
            secondaryCta={{ label: 'Tengo un código', href: '/onboarding' }}
          />
        )}
      </section>
    </>
  )
}
