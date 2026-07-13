"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy, Key, HelpCircle, ExternalLink, XCircle, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type { ToolCardData } from "@/features/dashboard/contracts"
import { formatCurrency } from "@/lib/utils"

interface SubscriptionDetailModalProps {
  tool: ToolCardData | null
  accessToken?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDetailModal({ tool, accessToken, open, onOpenChange }: SubscriptionDetailModalProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showToken, setShowToken] = useState(false)

  if (!tool) return null
  const provider = tool.provider ?? ''

  const handleCopy = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken)
      setCopied(true)
      toast.success("Credencial copiada al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-lg rounded-3xl p-0 overflow-hidden" showCloseButton={false}>
        <DialogTitle className="sr-only">Detalle de suscripción: {tool.name}</DialogTitle>
        <div className="p-8 space-y-6 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-0 right-0 h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-lg">
              {tool.iconLabel}
            </div>
            <div>
              <p className="text-sm text-cyan-400 font-semibold">{provider}</p>
              <h3 className="text-xl font-bold text-white">{tool.name}</h3>
            </div>
            <div className="ml-auto">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Activo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Pagás por mes</p>
              <p className="text-2xl font-bold text-white">${formatCurrency(tool.monthlyCost)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Vence en</p>
              <p className="text-2xl font-bold text-amber-400">30 días</p>
            </div>
          </div>

          {accessToken && (
            <>
              {(!tool.category && !['figma', 'canva', 'notion', 'chatgpt', 'hugging face', 'github'].includes(provider.toLowerCase()) || tool.category?.toLowerCase() === 'dev' || tool.category?.toLowerCase() === 'development') && (
                <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-semibold text-white text-sm">Tu credencial de acceso (API Key)</h4>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-black/40 border border-white/5 rounded-xl p-3">
                    <code className="font-mono text-sm text-zinc-300 truncate">
                      {showToken ? accessToken : (accessToken.length > 4 ? `••••••••••••${accessToken.slice(-4)}` : '••••••••')}
                    </code>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowToken(!showToken)}
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                        title={showToken ? "Ocultar" : "Mostrar"}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                        title="Copiar credencial"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">Usá este código para integrar {provider} en tu código. Vence junto con tu licencia.</p>
                </div>
              )}

              {(tool.category?.toLowerCase() === 'design' || tool.category?.toLowerCase() === 'ai' || ['figma', 'canva', 'notion', 'chatgpt', 'hugging face', 'github'].includes(provider.toLowerCase())) && (
                <div className="p-5 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-violet-400" />
                    <h4 className="font-semibold text-white text-sm">Invitación al Workspace Corporativo</h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Tu pago ha sido confirmado. Te enviamos la invitación por mail o podés unirte con el siguiente enlace seguro sin necesidad de compartir contraseñas.
                  </p>
                  <Button
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold h-11 rounded-xl"
                    onClick={() => {
                        window.open(accessToken.startsWith('http') ? accessToken : `https://${provider.toLowerCase().replace(/\s/g, '')}.com/invite/${accessToken}`, '_blank')
                    }}
                  >
                    Unirse al equipo en {provider}
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              Cómo usar tu licencia
            </h4>
            <ol className="space-y-2.5 text-sm text-zinc-300">
               {(tool.category?.toLowerCase() === 'design' || tool.category?.toLowerCase() === 'ai' || ['figma', 'canva', 'notion', 'chatgpt', 'hugging face', 'github'].includes(provider.toLowerCase())) ? (
                 <>
                  <li className="flex items-start gap-3"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold shrink-0 mt-0.5">1</span><span>Haz clic en "Unirse al equipo".</span></li>
                  <li className="flex items-start gap-3"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold shrink-0 mt-0.5">2</span><span>Inicia sesión con tu cuenta personal de {provider}.</span></li>
                  <li className="flex items-start gap-3"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold shrink-0 mt-0.5">3</span><span>¡Listo! Disfruta de todos los beneficios premium desde tu propio entorno.</span></li>
                 </>
               ) : (
                 <>
                  <li className="flex items-start gap-3"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">1</span><span>Copiá tu credencial de acceso (API Key).</span></li>
                  <li className="flex items-start gap-3"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">2</span><span>Ingresá a <strong className="text-white">{provider}</strong> o configurá tu entorno.</span></li>
                  <li className="flex items-start gap-3"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0 mt-0.5">3</span><span>Pegá tu credencial cuando el sistema la solicite para vincular tu licencia.</span></li>
                 </>
               )}
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border-white/10 text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Cerrar
            </Button>
            {tool.providerUrl && (
              <Button
                asChild
                className="flex-1 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold"
              >
                <a href={tool.providerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Ir a {provider}
                </a>
              </Button>
            )}
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors pt-2">
            <XCircle className="w-3.5 h-3.5" />
            Cancelar suscripción
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
