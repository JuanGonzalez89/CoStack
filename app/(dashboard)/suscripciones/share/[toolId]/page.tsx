"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CATALOG_TOOLS } from "@/components/dashboard/suscripciones-view"
import { Button } from "@/components/ui/button"
import { KeyRound, ShieldCheck, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ShareToolPage({ params }: { params: { toolId: string } }) {
  const router = useRouter()
  const tool = CATALOG_TOOLS.find(t => t.id === params.toolId)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  if (!tool) {
    router.push('/suscripciones')
    return null
  }

  const handleSave = async () => {
    if (!username || !password) {
      toast.error("Completá usuario y contraseña para compartir.")
      return
    }
    setIsSaving(true)
    // Mock: simulate saving credentials
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success("Credenciales guardadas. Ya podés compartir tu cuenta.")
    router.push('/overview')
  }

  return (
    <div className="max-w-2xl mx-auto pt-10 pb-20 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <button
        onClick={() => router.push('/suscripciones')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </button>

      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <img
            src={`/images/${tool.id}.png`}
            alt={tool.name}
            className="w-20 h-20 rounded-2xl relative z-10 object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
          Compartir {tool.name}
        </h1>
        <p className="text-zinc-400 max-w-md">
          Ingresá tus credenciales para que otros usuarios puedan acceder a tu cuenta. 
          CoStack las mantiene encriptadas y seguras.
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-zinc-300">
            Usuario o correo de la cuenta
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tucuenta@email.com"
            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-zinc-300">
            Contraseña de la cuenta
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-200/70">
            Tus credenciales se almacenan encriptadas. Nadie, ni siquiera CoStack, puede ver tu contraseña original.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-2xl py-6 font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Guardar y Publicar Cupo
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
