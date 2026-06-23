"use client"

import { useEffect, useState } from "react"
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLobbyPolling } from "@/hooks/use-lobby-polling"
import { SubscriptionDetailModal } from "@/components/suscripciones/subscription-detail-modal"
import type { ToolCardData } from "@/features/dashboard/contracts"

interface LobbyViewProps {
  tool: ToolCardData
  open: boolean
  onOpenChange: (open: boolean) => void
}

function calculateTimeLeft(expiresAt: string): { hours: number; minutes: number; seconds: number } | null {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function LobbyView({ tool, open, onOpenChange }: LobbyViewProps) {
  const { data, error } = useLobbyPolling(tool?.lobbyId ?? null)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)
  const [showPreparing, setShowPreparing] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    if ((data?.status === "completed" || data?.status === "processing") && !showFinal && !showPreparing) {
      // Allow progress bar to reach 100% and stay for 2 seconds before showing preparing modal
      const initialDelay = setTimeout(() => {
        setShowPreparing(true)
        const timer = setTimeout(() => {
          setShowPreparing(false)
          setShowFinal(true)
        }, 4000)
      }, 2000)
      return () => clearTimeout(initialDelay)
    }
  }, [data?.status, showFinal, showPreparing])

  useEffect(() => {
    if (!data?.expiresAt) return
    const tick = () => setTimeLeft(calculateTimeLeft(data.expiresAt))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [data?.expiresAt])

  if (showFinal && data?.accessToken) {
    const completedTool: ToolCardData = {
      ...tool,
      status: "assigned",
      accessToken: data.accessToken,
    }
    return (
      <SubscriptionDetailModal
        tool={completedTool}
        accessToken={data.accessToken}
        open={open}
        onOpenChange={onOpenChange}
      />
    )
  }

  if (showPreparing) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="bg-zinc-950 border border-white/10 text-white max-w-sm w-full rounded-3xl p-8 text-center space-y-6 mx-4">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Preparando tu licencia</h3>
            <p className="text-sm text-zinc-400">
              El grupo se completó. CoStack está procesando los pagos y generando la credencial de acceso...
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isExpired = data?.status === "expired"
  const filled = data?.filledSeats ?? 0
  const total = data?.totalSeats ?? 0
  const progress = total > 0 ? (filled / total) * 100 : 0

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-zinc-950 border border-white/10 text-white max-w-lg w-full rounded-3xl p-8 space-y-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {isExpired ? (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tiempo agotado</h3>
                <p className="text-sm text-zinc-400">{tool.name}</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <p className="font-semibold text-white text-sm">No se completaron los cupos a tiempo</p>
              </div>
              <p className="text-sm text-zinc-400">
                No se alcanzaron los {total} cupos necesarios en 24 horas. Tu pago de <strong className="text-white">${data.pricePerSeat?.toFixed(2)}</strong> será devuelto automáticamente.
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl bg-white hover:bg-zinc-200 text-black font-bold h-12"
            >
              Entendido
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-cyan-400 font-semibold">Sala de espera</p>
                <h3 className="text-xl font-bold text-white">{data?.toolName ?? tool?.name}</h3>
                <p className="text-xs text-zinc-500">{data?.provider ?? tool?.provider}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Progreso</span>
                <span className="text-white font-semibold">{filled}/{total} cupos</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {timeLeft && (
              <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-3xl font-bold tabular-nums text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-3xl font-bold tabular-nums text-white">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {data?.members.map((member) => (
                <div
                  key={member.seatIndex}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                    member.isSelf
                      ? "bg-cyan-500/10 border border-cyan-500/20"
                      : member.isMock
                        ? "bg-white/[0.015] border border-white/5"
                        : "bg-white/[0.02] border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {member.seatIndex}
                    </span>
                    <span className={member.isSelf ? "text-cyan-300 font-semibold" : "text-zinc-300"}>
                      {member.isSelf ? "Vos" : member.isMock ? `Miembro ${member.seatIndex}` : `Miembro ${member.seatIndex}`}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-semibold">${member.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {filled < total && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Esperando {total - filled} cupo{total - filled !== 1 ? "s" : ""} más. Si no se completa en 24hs se devuelve el <strong className="text-white">100%</strong>.
                </span>
              </div>
            )}

            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full rounded-xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-12"
            >
              Cerrar y volver después
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
