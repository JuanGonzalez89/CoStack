"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function WithdrawFundsModal({ balance, children }: { balance: number, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [method, setMethod] = useState<"mp" | "crypto">("mp")

  const handleWithdraw = async () => {
    setIsProcessing(true)
    // Simulamos la llamada a una API
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setIsOpen(false)
    toast.success(`Retiro de $${formatCurrency(balance)} iniciado con éxito a ${method === "mp" ? "MercadoPago" : "Crypto Wallet"}.`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <DialogTitle className="text-center text-xl">Retirar Fondos</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Tienes <strong className="text-zinc-200">${formatCurrency(balance)}</strong> disponibles para retirar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-sm font-semibold text-zinc-300">Selecciona el método de retiro:</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMethod("mp")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === "mp" ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}
            >
              <ArrowRightLeft className="w-6 h-6" />
              <span className="text-sm font-bold">MercadoPago</span>
            </button>
            <button 
              onClick={() => setMethod("crypto")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === "crypto" ? "border-violet-500 bg-violet-500/10 text-violet-400" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}
            >
              <Wallet className="w-6 h-6" />
              <span className="text-sm font-bold">Crypto (USDT)</span>
            </button>
          </div>

          <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 mt-2">
            <p className="text-xs text-zinc-500 text-center">
              Los retiros pueden tardar hasta 24 horas hábiles en procesarse por razones de seguridad.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleWithdraw} 
            disabled={isProcessing || balance <= 0}
            className="bg-white text-black hover:bg-zinc-200 font-bold px-6"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isProcessing ? "Procesando..." : "Confirmar Retiro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
