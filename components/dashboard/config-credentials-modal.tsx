"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeyRound, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

export function ConfigCredentialsModal({ toolName, children }: { toolName: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simula guardar credenciales
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setIsOpen(false)
    toast.success("Credenciales actualizadas y encriptadas con éxito.")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-cyan-400" />
          </div>
          <DialogTitle className="text-center text-xl">Configurar Accesos</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Ingresa las credenciales de <strong className="text-zinc-200">{toolName}</strong> para compartirlas de forma segura con tu grupo.
          </DialogDescription>
        </DialogHeader>
        
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 text-center space-y-4">
                <p className="text-sm text-zinc-300">
                  Recomendamos conectar tu cuenta directamente para validación automática.
                </p>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  className="w-full bg-white text-black hover:bg-zinc-200 border-0 h-12 text-base font-bold"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Conectar con Google
                </Button>
                <p className="text-xs text-zinc-500">
                  Verificaremos el estado de la suscripción (Trial vs Premium) automáticamente vía OAuth.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-950 px-2 text-zinc-500">O ingresa manualmente</span>
                </div>
              </div>

              <div className="space-y-3">
                <Input 
                  type="email" 
                  placeholder="ejemplo@empresa.com" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-cyan-500 text-zinc-100" 
                />
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-cyan-500 text-zinc-100" 
                />
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400">
                CoStack encripta estos datos (AES-256). Solo los miembros activos podrán visualizar la contraseña temporalmente.
              </p>
            </div>

            <DialogFooter className="mt-2">
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={isProcessing}
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-6"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isProcessing ? "Guardando..." : "Guardar Manual"}
              </Button>
            </DialogFooter>
          </div>
      </DialogContent>
    </Dialog>
  )
}
