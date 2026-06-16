"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ShareToolView({ tool, userId }: { tool: any, userId: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [price, setPrice] = useState((tool.monthlyCost / 4).toFixed(2))

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const res = await fetch('/api/groups/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          username: credentials.username,
          password: credentials.password,
          price: Number(price)
        })
      })

      if (!res.ok) throw new Error('Failed to share tool')
      
      const data = await res.json()
      toast.success('Herramienta compartida exitosamente.')
      router.push('/overview')
    } catch (e) {
      toast.error('Error al compartir herramienta.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Compartir {tool.name}</h1>
          <p className="text-zinc-400 mt-1">Configura las credenciales y el precio por vacante.</p>
        </div>
      </div>

      <form onSubmit={handleShare} className="space-y-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Credenciales de Acceso</h3>
              <p className="text-sm text-zinc-400">Estas credenciales se encriptarán de forma segura.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Usuario / Email</label>
              <input 
                type="text" 
                required
                value={credentials.username}
                onChange={e => setCredentials({...credentials, username: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="ej: usuario@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Contraseña Compartida</label>
              <input 
                type="password" 
                required
                value={credentials.password}
                onChange={e => setCredentials({...credentials, password: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Precio por Vacante</h3>
          <p className="text-sm text-zinc-400 mb-6">Define cuánto cobrarás mensualmente a cada miembro.</p>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
            <input 
              type="number" 
              step="0.01"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/30 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isProcessing}
          className="w-full h-14 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
        >
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
          {isProcessing ? "Compartiendo..." : "Publicar Herramienta"}
        </Button>
      </form>
    </div>
  )
}
