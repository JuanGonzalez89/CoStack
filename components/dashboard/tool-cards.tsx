"use client"

import { useState } from "react"
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Users,
  Loader2,
  CreditCard,
  MessageSquare,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type PaymentState = "pending" | "paying" | "assigning" | "assigned"

interface Tool {
  id: string
  name: string
  provider: string
  monthlyCost: number
  seatsUsed: number
  seatsTotal: number
  userStatus: PaymentState
  accentBg: string
  iconBg: string
  iconText: string
  iconLabel: string
}

const initialTools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Team Workspace",
    provider: "OpenAI",
    monthlyCost: 30,
    seatsUsed: 4,
    seatsTotal: 5,
    userStatus: "pending",
    accentBg: "bg-orange-500",
    iconBg: "bg-orange-500/10",
    iconText: "text-orange-600",
    iconLabel: "GPT",
  },
  {
    id: "figma",
    name: "Figma Organization",
    provider: "Figma Inc.",
    monthlyCost: 45,
    seatsUsed: 8,
    seatsTotal: 10,
    userStatus: "assigned",
    accentBg: "bg-violet-500",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600",
    iconLabel: "FIG",
  },
]

const statusLabels: Record<PaymentState, string> = {
  pending: "Cuota Pendiente",
  paying: "Procesando Pago...",
  assigning: "Asignando Asiento...",
  assigned: "Asiento Asignado",
}

function SeatDots({ used, total }: { used: number; total: number }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-2.5 h-2.5 rounded-full border transition-all duration-300",
            i < used ? "bg-cyan-500 border-cyan-500" : "bg-transparent border-border"
          )}
        />
      ))}
    </div>
  )
}

interface ToolCardProps {
  tool: Tool
  onRequestPay: (id: string) => void
}

function ToolCard({ tool, onRequestPay }: ToolCardProps) {
  const isPending = tool.userStatus === "pending"
  const isPaying = tool.userStatus === "paying"
  const isAssigning = tool.userStatus === "assigning"
  const isAssigned = tool.userStatus === "assigned"
  const isLoading = isPaying || isAssigning

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300",
        isPending && "border-orange-200 shadow-orange-50",
        isLoading && "border-cyan-200",
        isAssigned && "border-emerald-200 shadow-emerald-50"
      )}
    >
      {/* Top accent stripe */}
      <div className={cn("h-1 w-full", tool.accentBg)} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", tool.iconBg, tool.iconText)}>
              {tool.iconLabel}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">{tool.name}</h3>
              <p className="text-xs text-muted-foreground">{tool.provider}</p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300",
              isPending && "bg-orange-100 text-orange-700",
              isLoading && "bg-cyan-100 text-cyan-700",
              isAssigned && "bg-emerald-100 text-emerald-700"
            )}
          >
            {isLoading && <Loader2 size={11} className="animate-spin" />}
            {isPending && <AlertTriangle size={11} />}
            {isAssigned && <CheckCircle2 size={11} />}
            {statusLabels[tool.userStatus]}
          </span>
        </div>

        {/* Cost */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-foreground">${tool.monthlyCost}</span>
          <span className="text-xs text-muted-foreground">/mes por asiento</span>
        </div>

        {/* Seats */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users size={12} />
              Asientos ocupados
            </span>
            <span className="text-xs font-semibold text-foreground">
              {tool.seatsUsed}/{tool.seatsTotal}
            </span>
          </div>
          <SeatDots used={tool.seatsUsed} total={tool.seatsTotal} />
        </div>

        {/* Bot confirmation row (assigned only) */}
        {isAssigned && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
            <Bot size={14} className="text-emerald-600 shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">
              OpenClaw Bot envió link de invitación por DM
            </span>
            <MessageSquare size={12} className="text-emerald-500 ml-auto shrink-0" />
          </div>
        )}

        <div className="border-t border-border mb-4" />

        {/* Action */}
        {isPending && (
          <Button
            onClick={() => onRequestPay(tool.id)}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl gap-2 transition-all duration-150"
            size="sm"
          >
            <CreditCard size={14} />
            Pagar ${tool.monthlyCost} y Asignar Asiento
          </Button>
        )}

        {isLoading && (
          <Button
            disabled
            className="w-full bg-cyan-500/70 text-white font-semibold rounded-xl gap-2 cursor-not-allowed"
            size="sm"
          >
            <Loader2 size={14} className="animate-spin" />
            {isPaying ? "Verificando pago..." : "Bot asignando asiento..."}
          </Button>
        )}

        {isAssigned && (
          <Button
            disabled
            variant="outline"
            className="w-full border-emerald-300 text-emerald-700 bg-emerald-50 font-semibold rounded-xl gap-2 cursor-default"
            size="sm"
          >
            <Lock size={14} />
            Pago al día
          </Button>
        )}
      </div>
    </div>
  )
}

export function ToolCards({ onBotLog }: { onBotLog?: (msg: string) => void }) {
  const [tools, setTools] = useState(initialTools)
  const [pendingPayId, setPendingPayId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const pendingTool = tools.find((t) => t.id === pendingPayId)

  const handleRequestPay = (id: string) => {
    setPendingPayId(id)
  }

  const handleConfirmPay = () => {
    if (!pendingPayId) return
    const id = pendingPayId
    setIsConfirming(true)

    setTimeout(() => {
      // Close modal, start flow
      setIsConfirming(false)
      setPendingPayId(null)

      // Step 1: paying
      setTools((prev) =>
        prev.map((t) => (t.id === id ? { ...t, userStatus: "paying" } : t))
      )
      onBotLog?.(`Procesando pago de $30.00 de Martín Pérez...`)

      // Step 2: assigning
      setTimeout(() => {
        setTools((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, userStatus: "assigning", seatsUsed: t.seatsUsed + 1 } : t
          )
        )
        onBotLog?.(`Pago recibido de Martín Pérez. Liberando 1 asiento para ChatGPT Team.`)
      }, 1800)

      // Step 3: assigned — the "Magic Moment" log line
      setTimeout(() => {
        setTools((prev) =>
          prev.map((t) => (t.id === id ? { ...t, userStatus: "assigned" } : t))
        )
        onBotLog?.(`[BOT] Pago confirmado. OpenClaw enviando enlace de ChatGPT a Martín Pérez por DM.`)
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Tus Asignaciones</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gestiona tus asientos en licencias compartidas del equipo
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onRequestPay={handleRequestPay} />
          ))}
        </div>
      </section>
    </>
  )
}
