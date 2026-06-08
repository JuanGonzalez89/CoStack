"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  CreditCard,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CATALOG_TOOLS } from "./suscripciones-view"

// Idealmente, obtendríamos esto de una API o contexto, pero para mantener la consistencia con suscripciones-view, 
// podemos recibirlo como prop o buscarlo.
interface CheckoutViewProps {
  toolSlug: string
  isOrganizer?: boolean
}

export function CheckoutView({ toolSlug, isOrganizer = false }: CheckoutViewProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutos en segundos
  const [isProcessing, setIsProcessing] = useState(false)
  const [businessEmail, setBusinessEmail] = useState("")

  const tool = CATALOG_TOOLS.find(t => t.id === toolSlug) || CATALOG_TOOLS[0]
  
  const originalPrice = tool.originalPrice
  const memberPrice = tool.pricePerMonth
  const estimatedReturn = originalPrice - memberPrice

  useEffect(() => {
    if (!isOrganizer) {
      // Al montar, podríamos llamar a /api/checkout/reserve
      fetch('/api/checkout/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug })
      }).catch(console.error)
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error("El tiempo de reserva expiró.")
          router.push('/suscripciones')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [toolSlug, router])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handlePayment = async () => {
    if (tool.isBusiness && !businessEmail && !isOrganizer) {
      toast.error("Por favor ingresa tu correo para recibir la invitación.")
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch('/api/checkout/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, businessEmail })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Error en el pago")

      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url
        return
      }

      toast.success("¡Pago confirmado! Preparando tu acceso...")
      setTimeout(() => {
        router.push(`/suscripciones/success/${toolSlug}`)
      }, 1500)
    } catch (error: any) {
      const msg = error?.message || "Hubo un problema procesando tu pago."
      toast.error(msg)
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-3 mb-6">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 pb-2">
          {isOrganizer ? "Adquirir Licencia Maestra" : "Finalizar Compra"}
        </h2>
        <p className="text-lg text-muted-foreground/80 font-medium">
          {isOrganizer 
            ? "Estás a un paso de activar esta herramienta para tu equipo." 
            : "Estás a un paso de obtener tu licencia a una fracción del costo."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda - Detalles y Reglas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl border border-white/5 bg-zinc-950/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
            {isOrganizer ? (
              <>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  ¿Cómo funciona ser Organizador?
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Asegura la licencia hoy</p>
                      <p className="text-sm text-zinc-400">Pagás la totalidad de la licencia para activarla. CoStack te garantiza recuperar la parte de los miembros a medida que se unan.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Llenado Automático (Automatch)</p>
                      <p className="text-sm text-zinc-400">Si no tienes a quién invitar, el sistema ofrecerá tus cupos libres en nuestra comunidad. Los usuarios pagarán y el dinero irá directo a tu Billetera.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Control Total</p>
                      <p className="text-sm text-zinc-400">Tendrás un código de invitación privado para tu propio equipo. Nadie entra sin tu aprobación final.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Ingresos Garantizados</p>
                      <p className="text-sm text-zinc-400">Bajo el Estándar CoStack, los miembros pagan el mes completo. Si alguien cancela, su cupo se libera al terminar los 30 días y Automatch lo reemplaza automáticamente.</p>
                    </div>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  ¿Cómo funciona el Pool?
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Acceso Compartido, Trabajo Privado</p>
                      <p className="text-sm text-zinc-400">Compartes el costo de la licencia con otros desarrolladores, pero tu código y datos permanecen estrictamente privados.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Garantía de Uso 24/7</p>
                      <p className="text-sm text-zinc-400">Nuestros pools están limitados estrictamente para asegurar que nunca te quedes sin acceso cuando más lo necesitas.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Suscripción Simple (Estándar CoStack)</p>
                      <p className="text-sm text-zinc-400">Pagás el mes entero y podés darte de baja cuando quieras con un clic. Tu acceso dura los 30 días completos, sin letra chica.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Credenciales al Instante</p>
                      <p className="text-sm text-zinc-400">Una vez confirmado el pago, recibirás las credenciales automáticamente en tu Billetera de Suscripciones.</p>
                    </div>
                  </li>
                </ul>
              </>
            )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 flex items-start gap-4 shadow-lg shadow-emerald-500/5">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-emerald-50 text-lg">Pago Seguro & Encriptado</p>
              <p className="text-sm text-emerald-200/70 mt-1 leading-relaxed">Tus transacciones están procesadas por Stripe. Esta es una reserva temporal y tu tarjeta no será cobrada hasta la confirmación final de cupos.</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resumen de Compra */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500 hover:border-white/20">
            {/* Banner de Urgencia */}
            <div className="absolute top-0 left-0 right-0 bg-rose-500/10 border-b border-rose-500/20 py-3 px-6 flex justify-between items-center backdrop-blur-md">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Cupo Reservado
              </span>
              <span className="text-sm font-black text-rose-500 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="pt-10">
              <h4 className="font-bold text-white mb-4 text-xl">Resumen de tu pedido</h4>

              {(!isOrganizer && tool.isBusiness) && (
                <div className="mb-6 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-3">
                  <label className="block text-sm font-semibold text-violet-200">
                    ¿A qué correo enviamos la invitación?
                  </label>
                  <input 
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="tucorreo@empresa.com"
                    className="w-full h-12 bg-black/40 border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-xs text-violet-200/60">
                    Asegúrate de ingresar el correo que usas en {tool.provider}.
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 capitalize">{tool.name} ({isOrganizer ? 'Licencia Completa' : 'Licencia Compartida'})</span>
                  <span className="font-semibold text-white">{isOrganizer ? `$${originalPrice}.00` : `$${memberPrice}.00`}</span>
                </div>
                {isOrganizer && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-500">Retorno estimado (Automatch)</span>
                    <span className="font-semibold text-emerald-500">-${estimatedReturn}.00</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Gastos de gestión</span>
                  <span className="font-semibold text-white">$0.00</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-end">
                <span className="font-bold text-zinc-300">Total a pagar hoy</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-white block">{isOrganizer ? `$${originalPrice}.00` : `$${memberPrice}.00`}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || timeLeft === 0}
                className="w-full rounded-2xl py-6 text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 bg-white hover:bg-zinc-200 text-black flex gap-2 items-center justify-center hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="truncate">Asegurando Cupo...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="truncate">Confirmar Pago &mdash; {isOrganizer ? `$${originalPrice}` : `$${memberPrice}`}</span>
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-4 px-2 leading-relaxed">
                Podés cancelar en cualquier momento. Tu acceso continuará hasta finalizar tus 30 días.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
