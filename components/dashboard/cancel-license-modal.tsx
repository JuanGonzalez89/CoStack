"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CancelLicenseModal({ toolName, children }: { toolName: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleCancel = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setIsOpen(false)
    toast.success(`La licencia de ${toolName} se cancelará al finalizar el ciclo actual.`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <DialogTitle className="text-center text-xl text-red-400">¿Cancelar Licencia?</DialogTitle>
          <DialogDescription className="text-center text-zinc-400 mt-2">
            Estás a punto de cancelar tu suscripción a <strong className="text-zinc-200">{toolName}</strong>. 
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 text-sm text-zinc-300">
          <p>
            Al confirmar esta acción, ocurrirá lo siguiente:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Tu grupo dejará de aceptar nuevos miembros inmediatamente.</li>
            <li>Dejarás de percibir ingresos por esta herramienta para el próximo ciclo.</li>
            <li>Los miembros actuales mantendrán su acceso hasta que finalicen los 30 días que ya abonaron.</li>
            <li>Cualquier pago en "Compra Protegida" de este ciclo será liberado normalmente a tu Billetera.</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-2">
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Mantener Licencia
          </Button>
          <Button 
            onClick={handleCancel} 
            disabled={isProcessing}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isProcessing ? "Procesando..." : "Sí, Cancelar Licencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
