"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Zap, ShieldCheck, ArrowRight, X, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATALOG } from "@/lib/catalog"
import type { CatalogItem } from "@/lib/catalog"

interface LicenseDetailModalProps {
  toolSlug: string | null
  isOrganizer?: boolean
  onClose: () => void
}

export function LicenseDetailModal({ toolSlug, isOrganizer = false, onClose }: LicenseDetailModalProps) {
  const router = useRouter()
  const tool = toolSlug ? CATALOG.find((t) => t.id === toolSlug) : null

  if (!tool) return null

  const savings = Math.round((1 - tool.pricePerMonth / tool.originalPrice) * 100)

  const handleConfirm = () => {
    onClose()
    router.push(`/suscripciones/checkout/${tool.id}`)
  }

  return (
    <Dialog open={!!toolSlug} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-2xl rounded-3xl p-0 overflow-hidden" showCloseButton={false}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">{tool.name}</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">por {tool.provider}</DialogDescription>
            </div>
            <div className="ml-auto text-right">
              <span className="text-zinc-500 line-through text-sm">${tool.originalPrice}</span>
              <p className="text-2xl font-black text-white">${tool.pricePerMonth}</p>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">-{savings}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              "Acceso completo a todas las features",
              "Soporte prioritario del proveedor",
              "Actualizaciones automáticas incluidas",
              "Credenciales rotativas cada 30 días",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-white">Pago protegido:</strong> si no podés acceder en 24hs, devolvemos todo. Si salís antes del fin de mes, el período en curso no se reembolsa.
            </p>
          </div>

          <div className={cn("flex gap-3", isOrganizer && "hidden")}>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 h-10"
            >
              Seguir viendo
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold h-10"
            >
              OK, lo tengo
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {isOrganizer && (
            <Button
              onClick={handleConfirm}
              className="w-full rounded-xl bg-white hover:bg-zinc-200 text-black font-bold h-10"
            >
              Configurar y pagar
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
