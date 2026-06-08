"use client"

import { useState } from "react"
import { KeyRound, ShieldCheck, CheckCircle2, Copy, AlertTriangle, Mail, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SeatAccessCardData } from "@/features/dashboard/contracts"
import { cn } from "@/lib/utils"
import { ReportIssueButton } from "./report-issue-button"

const stateStyles = {
  current: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  blocked: "bg-red-400/10 text-red-100 border-red-400/20",
}

interface SuccessAccessCardProps extends SeatAccessCardData {
  isBusiness?: boolean
}

export function SuccessAccessCard({ seatId, accessState, groupName, accessToken, isBusiness = false }: SuccessAccessCardProps) {
  const [showCredentials, setShowCredentials] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(accessToken)
    alert("Credenciales copiadas al portapapeles")
  }

  return (
    <section className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className={cn(
          "w-16 h-16 rounded-2xl border flex items-center justify-center mb-6",
          isBusiness ? "bg-violet-500/10 border-violet-500/20" : "bg-cyan-500/10 border-cyan-500/20"
        )}>
          {isBusiness ? <Mail className="w-8 h-8 text-violet-400" /> : <CheckCircle2 className="w-8 h-8 text-cyan-400" />}
        </div>
        
        <h3 className="text-3xl font-bold text-zinc-50 mb-2">
          {isBusiness ? "Esperando Invitación" : "Acceso listo"}
        </h3>
        <p className="text-base text-zinc-400 max-w-md mb-8">
          Ya eres parte de <strong className="text-zinc-200">{groupName}</strong>. 
          {isBusiness 
            ? " Esta herramienta requiere que el organizador te invite oficialmente a tu correo. Por favor espera." 
            : " Tu credencial está habilitada."}
        </p>

        {!isBusiness && !showCredentials && (
          <Button 
            onClick={() => setShowCredentials(true)}
            className="w-full sm:w-auto rounded-2xl h-14 bg-white text-black hover:bg-zinc-200 font-bold text-lg px-10 mb-4 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <KeyRound className="w-5 h-5" />
            Revelar Contraseña
          </Button>
        )}

        {isBusiness && (
           <div className="w-full bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 text-left mb-4">
             <div className="flex items-center gap-3 mb-2">
               <ShieldCheck className="w-5 h-5 text-violet-400" />
               <h4 className="font-bold text-violet-100">Dinero Protegido 100%</h4>
             </div>
             <p className="text-sm text-violet-200/70">
               Tu <strong>pago está en garantía</strong>. Si el organizador no te envía la invitación oficial en 24 horas, puedes cancelar esta suscripción y recibirás un reembolso automático e inmediato.
             </p>
           </div>
        )}

        {(!isBusiness && showCredentials) && (
          <div className="w-full animate-in fade-in zoom-in duration-300 bg-black/20 border border-white/5 rounded-2xl p-6 text-left mb-4">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <KeyRound size={14} />
                Contraseña Compartida
              </div>
              <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider", stateStyles[accessState])}>
                <ShieldCheck size={14} />
                {accessState === "current" ? "Al día" : "Bloqueado"}
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 bg-black/40 border border-white/5 rounded-2xl p-4 mb-5">
              <code className="font-mono text-lg text-zinc-300">{accessToken}</code>
              <Button 
                variant="default" 
                onClick={handleCopy}
                className="bg-white text-black hover:bg-zinc-200 font-bold px-4 h-10 rounded-xl flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>
          </div>
        )}

        {/* Acciones del Miembro (Cancelar/Reportar) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-white/5">
          <Button variant="ghost" className="text-zinc-500 hover:text-zinc-300">
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar Suscripción
          </Button>
          {seatId && <ReportIssueButton seatId={seatId} />}
        </div>
      </div>
    </section>
  )
}
