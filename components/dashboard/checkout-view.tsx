"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, ShieldCheck, Zap, Users, Lock, Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { CATALOG, computeCheckoutPricing } from "@/lib/catalog"
import { formatCurrency } from "@/lib/utils"

interface CheckoutViewProps {
  toolSlug: string
  isOrganizer?: boolean
}

export function CheckoutView({ toolSlug, isOrganizer = false }: CheckoutViewProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(600)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mpReady, setMpReady] = useState(false)
  const [mpInstance, setMpInstance] = useState<any>(null)

  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [docType, setDocType] = useState("DNI")
  const [docNumber, setDocNumber] = useState("")

  const tool = CATALOG.find(t => t.id === toolSlug) || CATALOG[0]
  const originalPrice = tool.originalPrice
  const memberPrice = tool.pricePerMonth
  const estimatedReturn = originalPrice - memberPrice
  const pricing = computeCheckoutPricing(memberPrice)

  const mpPublicKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_MP_PUBLIC_KEY : null

  useEffect(() => {
    if (!mpPublicKey) return

    const script = document.createElement("script")
    script.src = "https://sdk.mercadopago.com/js/v2"
    script.async = true
    script.onload = () => {
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(mpPublicKey, { locale: "es-AR" })
        setMpInstance(mp)
        setMpReady(true)
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [mpPublicKey])

  useEffect(() => {
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

  const handleExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`)
    } else {
      setCardExpiry(cleaned)
    }
  }

  const handleCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const groups = cleaned.match(/.{1,4}/g)
    setCardNumber(groups ? groups.join(" ") : cleaned)
  }

  const tokenizeCard = useCallback(async (): Promise<string> => {
    if (!mpInstance) throw new Error("Mercado Pago SDK no cargado")

    const [month, year] = cardExpiry.split("/")

    const cardToken = await mpInstance.createCardToken({
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardExpirationMonth: month,
      cardExpirationYear: year.length === 2 ? `20${year}` : year,
      securityCode: cardCvv,
      cardholderName: cardName,
      identificationType: docType,
      identificationNumber: docNumber,
    })

    return cardToken.id
  }, [cardNumber, cardExpiry, cardCvv, cardName, docType, docNumber, mpInstance])

  const handlePayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName || !docNumber) {
      toast.error("Completá todos los campos de la tarjeta.")
      return
    }

    setIsProcessing(true)
    try {
      const cardTokenId = await tokenizeCard()

      const res = await fetch('/api/checkout/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, accessMethod: 'INVITATION_LINK', cardToken: cardTokenId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al procesar el pago")

      toast.success("Te uniste a la sala de espera. Tu dinero está protegido.")
      setTimeout(() => {
        router.push(`/suscripciones/success?tool=${toolSlug}&lobbyId=${data.lobbyId}`)
      }, 1500)
    } catch (error: any) {
      const msg = error?.message || "Hubo un problema procesando tu pago."
      toast.error(msg)
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column — info + card form */}
        <div className="lg:col-span-3 space-y-6">
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

          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              <p className="text-sm text-zinc-300">
                Vas a recibir un <strong className="text-white">enlace de invitación oficial</strong> para unirte al equipo de la herramienta. Sin compartir contraseñas.
              </p>
            </div>
          </div>

          {/* Card form section — más espacio */}
          <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/80">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-cyan-400" />
              </div>
              Datos de pago
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-300 mb-1.5 block font-medium">Número de tarjeta</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => handleCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-300 mb-1.5 block font-medium">Vencimiento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => handleExpiry(e.target.value)}
                    maxLength={5}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 mb-1.5 block font-medium">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    maxLength={4}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-300 mb-1.5 block font-medium">Titular de la tarjeta</label>
                <input
                  type="text"
                  placeholder="Como figura en la tarjeta"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <div>
                  <label className="text-sm text-zinc-300 mb-1.5 block font-medium">Tipo</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CI">CI</option>
                    <option value="RUT">RUT</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-300 mb-1.5 block font-medium">Número de documento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-300">
              <strong className="text-white">Pago protegido.</strong> Si la sala no se completa en 24hs, recibís el reembolso automático del 100%.
            </p>
          </div>
        </div>

        {/* Right sidebar — timer, summary, pay button */}
        <div className="lg:col-span-2 space-y-6">
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
                  <span className="font-semibold text-white">${formatCurrency(pricing.base)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Comisión CoStack ({Math.round(pricing.commissionRate * 100)}%)</span>
                  <span className="font-semibold text-zinc-300">${formatCurrency(pricing.commission)}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mb-6 flex justify-between items-end">
                <span className="font-bold text-white">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-white block">${formatCurrency(pricing.total)}</span>
                  <span className="text-xs text-zinc-500">ARS / mes</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || timeLeft === 0 || !mpReady}
                className="w-full rounded-xl h-12 text-sm font-bold transition-all duration-200 bg-cyan-500 hover:bg-cyan-400 text-black flex gap-2 items-center justify-center active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pagar · ${formatCurrency(pricing.total)}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-zinc-500 flex items-center justify-center gap-1 mt-3">
                <Lock className="w-3 h-3" />
                Pago seguro procesado por Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
