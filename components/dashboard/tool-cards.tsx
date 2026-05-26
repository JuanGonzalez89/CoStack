"use client"

import { useEffect, useState } from 'react'
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
  const [tools, setTools] = useState(toolsProp ?? initialTools)
  const [pendingPayId, setPendingPayId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (toolsProp) {
      setTools(toolsProp)
    }
  }, [toolsProp])

  const pendingTool = tools.find((t) => t.id === pendingPayId)

  const handleRequestPay = (id: string) => {
    setPendingPayId(id)
  }

  const handleConfirmPay = () => {
    if (!pendingPayId) return
    const id = pendingPayId
    setIsConfirming(true)

    setTimeout(() => {
      setIsConfirming(false)
      setPendingPayId(null)

      setTools((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'paying' } : t)))

      setTimeout(() => {
        setTools((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: 'assigning', seatsUsed: t.seatsUsed + 1 } : t
          )
        )
      }, 1800)

      setTimeout(() => {
        setTools((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'assigned' } : t)))
      }, 3800)
    }, 1000)
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
                  por un asiento en{" "}
                  <span className="font-semibold text-foreground">{pendingTool.name}</span>.
                  OpenClaw Bot te enviará el enlace de acceso por DM al confirmar.
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">Herramientas</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">CTA contextual por suscripción</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gestiona tus asientos en licencias compartidas del equipo
            </p>
          </div>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onRequestPay={handleRequestPay} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageOpen}
            variant="action"
            title="Todavía no hay herramientas cargadas"
            description="Cuando exista un grupo persistido, las suscripciones y asientos aparecerán acá con su CTA contextual."
            cta={{ label: 'Crear grupo', href: '/onboarding' }}
            secondaryCta={{ label: 'Tengo un código', href: '/onboarding' }}
          />
        )}
      </section>
    </>
  )
}
