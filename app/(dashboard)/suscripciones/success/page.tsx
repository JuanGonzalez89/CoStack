"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CATALOG } from "@/lib/catalog"
import { ROUTES } from "@/lib/constants/routes"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, LayoutDashboard, CreditCard, Key, HelpCircle, Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toolSlug = searchParams.get("tool")
  const lobbyId = searchParams.get("lobbyId")
  const paymentId = searchParams.get("payment_id")
  const mpStatus = searchParams.get("status")
  const pending = searchParams.get("pending")
  const [visible, setVisible] = useState(false)
  const [confirming, setConfirming] = useState(!!(lobbyId && paymentId))
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const tool = toolSlug ? CATALOG.find((t) => t.id === toolSlug) : null

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (lobbyId && paymentId && mpStatus === "approved") {
      const confirm = async () => {
        try {
          const res = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lobbyId, paymentId }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "Error al confirmar")
          setConfirming(false)
          toast.success("¡Pago confirmado! Te uniste a la sala.")
        } catch (e: any) {
          setConfirming(false)
          setConfirmError(e.message)
          toast.error(e.message)
        }
      }
      confirm()
    } else if (lobbyId && !paymentId) {
      setConfirming(false)
    }
  }, [lobbyId, paymentId, mpStatus])

  const isPending = mpStatus === "pending" || mpStatus === "in_process" || pending === "1"
  const isRejected = mpStatus === "failure" || mpStatus === "rejected" || mpStatus === "null"

  if (confirming) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-zinc-400">Confirmando tu pago...</p>
        </div>
      </div>
    )
  }

  if (confirmError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Error al confirmar</h1>
          <p className="text-zinc-400 mb-6">{confirmError}</p>
          <Button onClick={() => router.push(ROUTES.suscripciones)} className="rounded-xl">
            Volver a suscripciones
          </Button>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Pago pendiente</h1>
          <p className="text-zinc-400 mb-6">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </p>
          <Button onClick={() => router.push(ROUTES.overview)} className="rounded-xl">
            Ir a mi Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Pago rechazado</h1>
          <p className="text-zinc-400 mb-6">
            El pago no pudo completarse. Intentá de nuevo con otro medio.
          </p>
          <Button onClick={() => router.back()} className="rounded-xl">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17L4 12" className="animate-draw-check" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            ¡Ya tenés tu licencia!
          </h1>
          <p className="text-zinc-400 max-w-sm mx-auto">
            El cupo está reservado y tus credenciales se están generando. En unos segundos podrás acceder.
          </p>
        </div>

        {tool && (
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-cyan-400 font-semibold">{tool.provider}</p>
                <h3 className="text-lg font-bold text-white">{tool.name}</h3>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-zinc-400">Plan</span>
              <span className="text-white font-semibold">Compartido - 1 mes</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-zinc-400">Pagaste</span>
              <span className="text-emerald-400 font-bold text-lg">${formatCurrency(tool.pricePerMonth)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-zinc-400">Estado</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Activo
              </span>
            </div>
          </div>
        )}

        <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 mb-8 space-y-4">
          <h4 className="font-semibold text-white text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Cómo usar tu licencia
          </h4>
          <ol className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-medium text-white">Andá a tu Dashboard</p>
                <p className="text-zinc-400 text-xs mt-0.5">Hacé clic en "Ir a mi Dashboard" abajo.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-medium text-white">Encontrá tu credencial de acceso</p>
                <p className="text-zinc-400 text-xs mt-0.5">En la tarjeta de {tool?.name ?? "tu herramienta"} vas a ver un código de acceso único. Copialo.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-medium text-white">Usalo para activar tu cuenta</p>
                <p className="text-zinc-400 text-xs mt-0.5">Ingresá a {tool?.provider ?? "la plataforma"} y usá el código para acceder. Tu licencia vence en 30 días.</p>
              </div>
            </li>
          </ol>
          <p className="text-xs text-zinc-500 flex items-start gap-2 pt-2 border-t border-cyan-500/10">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
            ¿Problemas para acceder? Contactanos desde Configuración y te ayudamos en minutos.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push(ROUTES.overview)}
            className="w-full rounded-xl py-6 bg-white hover:bg-zinc-200 text-black font-bold text-base"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Ir a mi Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.suscripciones)}
            className="w-full rounded-xl py-6 border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-base"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Ver mis suscripciones
          </Button>
        </div>
      </div>
    </div>
  )
}
