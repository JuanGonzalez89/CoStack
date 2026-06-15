"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, ShieldCheck, Zap, Users, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { CATALOG } from "@/lib/catalog"
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'

interface CheckoutViewProps {
  toolSlug: string
  isOrganizer?: boolean
}

export function CheckoutView({ toolSlug, isOrganizer = false }: CheckoutViewProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(600)
  const [isProcessing, setIsProcessing] = useState(false)
  const [accessMethod, setAccessMethod] = useState<'INVITATION_LINK' | 'API_PROXY'>('INVITATION_LINK')

  const tool = CATALOG.find(t => t.id === toolSlug) || CATALOG[0]
  const originalPrice = tool.originalPrice
  const memberPrice = tool.pricePerMonth
  const estimatedReturn = originalPrice - memberPrice

  useEffect(() => {
    // Inicializar Mercado Pago del lado del cliente
    if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: 'es-AR' })
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
    setIsProcessing(true)
    try {
      const res = await fetch('/api/checkout/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, accessMethod })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Error en el pago")

      if (data.url) {
        window.location.href = data.url
        return
      }

      if (data.lobbyId) {
        toast.success("Te uniste a la sala de espera.")
        setTimeout(() => {
          router.push(`/suscripciones/success?tool=${toolSlug}&lobbyId=${data.lobbyId}`)
        }, 1500)
        return
      }

      toast.success("Pago confirmado. Tu licencia está activa.")
      setTimeout(() => {
        router.push(`/suscripciones/success?tool=${toolSlug}`)
      }, 1500)
    } catch (error: any) {
      const msg = error?.message || "Hubo un problema procesando tu pago."
      toast.error(msg)
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {isOrganizer ? "Iniciar compra compartida" : "Finalizar compra"}
        </h2>
        <p className="text-zinc-400">
          {isOrganizer 
            ? "Vas a ser el primero. Cuando se completen los cupos, la licencia se activa para todos." 
            : "Pagá tu cupo y entrá a la sala de espera."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Cómo funciona
            </h3>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Elegís la herramienta y pagás tu cupo a precio reducido.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Entrás a la sala de espera junto con otros miembros.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Al completar los cupos, recibís tu licencia al instante.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              ¿Cómo querés usar tu licencia?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Button 
                  variant={accessMethod === 'INVITATION_LINK' ? 'default' : 'outline'} 
                  onClick={() => setAccessMethod('INVITATION_LINK')} 
                  className={`h-12 rounded-xl justify-start px-4 transition-all duration-200 ${accessMethod === 'INVITATION_LINK' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'bg-transparent border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-300'}`}
               >
                 Uso Web (Invitación Oficial)
               </Button>
               <Button 
                  variant={accessMethod === 'API_PROXY' ? 'default' : 'outline'} 
                  onClick={() => setAccessMethod('API_PROXY')} 
                  className={`h-12 rounded-xl justify-start px-4 transition-all duration-200 ${accessMethod === 'API_PROXY' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'bg-transparent border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-300'}`}
               >
                 Desarrollo (API Key)
               </Button>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              El motor de Auto-Match te agrupará únicamente con usuarios que busquen este mismo método de acceso.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-300">
              <strong className="text-white">Pago protegido.</strong> Si la sala no se completa en 24hs, recibís el reembolso automático del 100%.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bg-amber-500/5 border-b border-amber-500/10 py-2.5 px-4 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Cupo reservado
              </span>
              <span className="text-sm font-black text-amber-400 tabular-nums">{formatTime(timeLeft)}</span>
            </div>

            <div className="pt-10">
              <h4 className="font-bold text-white mb-4">Resumen</h4>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">{tool.name} ({tool.availableSeats} cupos)</span>
                  <span className="font-semibold text-white">${memberPrice}.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Gastos de gestión</span>
                  <span className="font-semibold text-zinc-400">$0.00</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mb-6 flex justify-between items-end">
                <span className="font-bold text-white">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-white block">${memberPrice}.00</span>
                  <span className="text-xs text-zinc-500">USD / mes</span>
                </div>
              </div>

              {process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ? (
                <div className="mt-4 bg-white rounded-xl overflow-hidden">
                  <CardPayment
                    initialization={{ amount: memberPrice }}
                    onSubmit={async (param) => {
                      // param.token es el card_token generado por MP
                      // se lo enviamos a nuestro backend para hacer la autorizacion
                      await handlePayment()
                    }}
                    customization={{
                      paymentMethods: {
                        minInstallments: 1,
                        maxInstallments: 1,
                      },
                      visual: {
                        style: {
                          theme: 'dark', // Si tienen un tema oscuro configurado
                          customVariables: {
                            textPrimaryColor: '#000000',
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || timeLeft === 0}
                  className="w-full rounded-xl h-12 text-sm font-bold transition-all duration-200 bg-cyan-500 hover:bg-cyan-400 text-black flex gap-2 items-center justify-center active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Confirmar pago · ${memberPrice}
                    </>
                  )}
                </Button>
              )}
              <p className="text-center text-xs text-zinc-500 mt-3">
                Podés cancelar en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
