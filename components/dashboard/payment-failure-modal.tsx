import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PaymentFailureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  toolName: string
  amount: string
  onRetry: () => void
}

export function PaymentFailureModal({
  open,
  onOpenChange,
  toolName,
  amount,
  onRetry,
}: PaymentFailureModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle size={18} />
          </div>
          <DialogTitle className="text-xl">El pago no pudo completarse</DialogTitle>
          <DialogDescription className="text-sm">
            No logramos confirmar <span className="font-semibold text-foreground">{toolName}</span> por <span className="font-semibold text-foreground">{amount}</span>. Reintentá para recuperar tu acceso y evitar que quede bloqueado.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button className="rounded-xl bg-red-500/80 text-white hover:bg-red-500" onClick={onRetry}>
            <RotateCcw size={14} />
            Reintentar ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}