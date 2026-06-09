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

  const tool = CATALOG_TOOLS.find(t => t.id === toolSlug) || CATALOG_TOOLS[0]
  
  const originalPrice = tool.originalPrice
  const memberPrice = tool.pricePerMonth
  const estimatedReturn = originalPrice - memberPrice

  useEffect(() => {
    // Al montar, podríamos llamar a /api/checkout/reserve
    fetch('/api/checkout/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolSlug })
    }).catch(console.error)

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
    setIsProcessing(true)
    try {
      const res = await fetch('/api/checkout/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Error en el pago")

      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url
        return
      }

      toast.success("¡Pago confirmado! Preparando tu acceso...")
      // Redirigir al dashboard/billetera (Etapa 4)
      setTimeout(() => {
        router.push('/overview') // o /billetera dependiendo de donde estemos
      }, 1500)
    } catch (error) {
      toast.error("Hubo un problema procesando tu pago.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
          {isOrganizer ? "Adquirir Licencia Maestra" : "Finalizar Compra"}
        </h2>
        <p className="text-muted-foreground">
          {isOrganizer 
            ? "Estás a un paso de activar esta herramienta para tu equipo." 
            : "Estás a un paso de obtener tu licencia a una fracción del costo."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda - Detalles y Reglas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card">
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
                      <p className="font-semibold text-foreground">Asegura la licencia hoy</p>
                      <p className="text-sm text-muted-foreground">Pagás la totalidad de la licencia para activarla. CoStack te garantiza recuperar la parte de los miembros a medida que se unan.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Llenado Automático (Automatch)</p>
                      <p className="text-sm text-muted-foreground">Si no tienes a quién invitar, el sistema ofrecerá tus cupos libres en nuestra comunidad. Los usuarios pagarán y el dinero irá directo a tu Billetera.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Control Total</p>
                      <p className="text-sm text-muted-foreground">Tendrás un código de invitación privado para tu propio equipo. Nadie entra sin tu aprobación final.</p>
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
                      <p className="font-semibold text-foreground">Acceso Compartido, Trabajo Privado</p>
                      <p className="text-sm text-muted-foreground">Compartes el costo de la licencia con otros desarrolladores, pero tu código y datos permanecen estrictamente privados.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Garantía de Uso 24/7</p>
                      <p className="text-sm text-muted-foreground">Nuestros pools están limitados estrictamente para asegurar que nunca te quedes sin acceso cuando más lo necesitas.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Credenciales al Instante</p>
                      <p className="text-sm text-muted-foreground">Una vez confirmado el pago, recibirás las credenciales automáticamente en tu Billetera de Suscripciones.</p>
                    </div>
                  </li>
                </ul>
              </>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-cyan-500 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-foreground">Pago Seguro</p>
              <p className="text-sm text-muted-foreground">Tus transacciones están encriptadas. Esta es una reserva temporal y tu tarjeta no será cobrada hasta la confirmación final.</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resumen de Compra */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 hover:border-cyan-500/30">
            {/* Banner de Urgencia */}
            <div className="absolute top-0 left-0 right-0 bg-rose-500/10 border-b border-rose-500/20 py-2.5 px-4 flex justify-between items-center">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Cupo Reservado
              </span>
              <span className="text-sm font-black text-rose-500 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="pt-10">
              <h4 className="font-bold text-foreground mb-4">Resumen de tu pedido</h4>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground capitalize">{tool.name} ({isOrganizer ? 'Licencia Completa' : 'Licencia Compartida'})</span>
                  <span className="font-semibold">{isOrganizer ? `$${originalPrice}.00` : `$${memberPrice}.00`}</span>
                </div>
                {isOrganizer && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-500">Retorno estimado (Automatch)</span>
                    <span className="font-semibold text-emerald-500">-${estimatedReturn}.00</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Gastos de gestión</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6 flex justify-between items-end">
                <span className="font-bold text-foreground">Total a pagar hoy</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-foreground block">{isOrganizer ? `$${originalPrice}.00` : `$${memberPrice}.00`}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || timeLeft === 0}
                className="w-full rounded-xl py-6 font-bold shadow-sm transition-all duration-200 bg-white hover:bg-zinc-200 text-black flex gap-2 items-center justify-center hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando Pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Confirmar Pago de {isOrganizer ? `$${originalPrice}.00` : `$${memberPrice}.00`}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Puedes cancelar en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
