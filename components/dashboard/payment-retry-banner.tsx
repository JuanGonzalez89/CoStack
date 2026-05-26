import { RotateCcw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentRetryBannerProps {
  title?: string
  description?: string
  onRetry: () => void
}

export function PaymentRetryBanner({
  title = "Hay un pago pendiente que bloquea el acceso",
  description = "Reintentá la operación para recuperar el estado al día y volver a navegar sin restricciones.",
  onRetry,
}: PaymentRetryBannerProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-600">
          <TriangleAlert size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">{title}</p>
          <p className="text-sm text-amber-800/80">{description}</p>
        </div>
      </div>

      <Button onClick={onRetry} className="rounded-xl bg-amber-600 text-white hover:bg-amber-500">
        <RotateCcw size={14} />
        Reintentar pago
      </Button>
    </div>
  )
}