"use client"

import { useEffect, useState } from "react"
import { useLobbyPolling } from "@/hooks/use-lobby-polling"
import { Users, Clock, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { SubscriptionDetailModal } from "@/components/suscripciones/subscription-detail-modal"
import type { ToolCardData } from "@/features/dashboard/contracts"

function calculateTimeLeft(expiresAt: string): { hours: number; minutes: number; seconds: number } | null {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function OrganizerLobbyClient({ lobbyId }: { lobbyId: string }) {
  const router = useRouter()
  const { data, error } = useLobbyPolling(lobbyId)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)
  const [showPreparing, setShowPreparing] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    if (data?.status === "completed" && !showFinal) {
      // Un pequeño retraso para asegurar transición suave
      const timer = setTimeout(() => {
        setShowFinal(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [data?.status, showFinal])

  useEffect(() => {
    if (!data?.expiresAt) return
    const tick = () => setTimeLeft(calculateTimeLeft(data.expiresAt))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [data?.expiresAt])

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-zinc-400">Cargando sala de espera...</p>
      </div>
    )
  }

  const filled = data.filledSeats
  const total = data.totalSeats
  const progress = total > 0 ? (filled / total) * 100 : 0
  const isCompleted = data.status === "completed"
  const isExpired = data.status === "expired"

  if (showFinal && data.accessToken) {
    const dummyTool: ToolCardData = {
      id: "dummy",
      slug: "dummy",
      lobbyId: data.id,
      name: data.toolName,
      provider: data.provider || "Provider",
      monthlyCost: data.pricePerSeat || 0,
      status: "assigned",
      accent: "cyan",
      iconLabel: data.toolName.substring(0, 2).toUpperCase(),
      accessToken: data.accessToken,
    }
    return (
      <SubscriptionDetailModal
        tool={dummyTool}
        accessToken={data.accessToken}
        open={true}
        onOpenChange={(open) => { if (!open) router.push(ROUTES.overview) }}
      />
    )
  }

  if (data.status === "processing" || showPreparing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/20 animate-pulse" />
          <Loader2 className="w-20 h-20 text-cyan-400 animate-spin relative z-10" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-3">CoStack está preparando tu licencia</h2>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            El cupo se ha completado. Estamos ejecutando la automatización en tiempo real para generar tu credencial oficial...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <button
        onClick={() => router.push(ROUTES.overview)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2 text-sm uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4" />
            Sala de Formación
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">{data.toolName}</h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Estamos buscando a {total - 1} personas más para completar el grupo y activar la licencia.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500 mb-1">Precio por miembro</p>
          <p className="text-3xl font-bold text-emerald-400">${data.pricePerSeat?.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-zinc-400 font-medium mb-1">Cupos ocupados</p>
                  <p className="text-5xl font-black text-white">
                    {filled} <span className="text-2xl text-zinc-500 font-bold">/ {total}</span>
                  </p>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Grupo Completo!
                  </div>
                )}
              </div>

              <div className="h-6 rounded-full bg-white/5 overflow-hidden mb-8 border border-white/5 p-1">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-1000 ease-out relative"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white mb-4">Integrantes actuales:</h3>
                {data.members.map((member) => {
                  const memberLabel = member.isSelf
                    ? "Vos (Organizador)"
                    : member.name
                      ? member.name
                      : member.email
                        ? member.email.split("@")[0]
                        : `Miembro ${member.seatIndex}`
                  return (
                    <div
                      key={member.seatIndex}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
                        member.isSelf
                          ? "bg-cyan-500/10 border border-cyan-500/20"
                          : "bg-white/[0.02] border border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          member.isSelf ? "bg-cyan-500 text-black" : "bg-white/10 text-zinc-400"
                        }`}>
                          {member.seatIndex}
                        </div>
                        <div>
                          <p className={`font-bold ${member.isSelf ? "text-cyan-400" : "text-zinc-200"}`}>
                            {memberLabel}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {member.isSelf ? "Organizador" : "Unido a la sala"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">${member.amount.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500">Aportado</p>
                      </div>
                    </div>
                  )
                })}
                
                {/* Empty slots placeholders */}
                {Array.from({ length: total - filled }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 border-dashed opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-white/5 text-zinc-600">
                        {filled + i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-500">Buscando miembro...</p>
                        <Loader2 className="w-3 h-3 text-cyan-400 animate-spin mt-1" />
                      </div>
                    </div>
                    <p className="font-mono text-sm text-zinc-600">--</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Time Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Tiempo Restante</h3>
            {timeLeft ? (
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-4xl font-black text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-zinc-500 font-bold">:</span>
                <span className="text-4xl font-black text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-zinc-500 font-bold">:</span>
                <span className="text-4xl font-black text-white">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-rose-400 mb-4">Agotado</p>
            )}
            <p className="text-xs text-zinc-500 leading-relaxed">
              Plazo de 24 horas para formar el grupo. Si no se completa, el grupo se cancela.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              ¿Qué pasa al terminar?
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                Si se llena: se cobra el pago, se arma el grupo automáticamente y se te entrega la credencial de acceso a {data.toolName}.
              </li>
              <li className="flex gap-2">
                <span className="text-rose-400 shrink-0">✗</span>
                Si expira el tiempo: se cancela la sala y se te devuelve tu pago inicial de ${data.pricePerSeat?.toFixed(2)} sin vueltas.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
