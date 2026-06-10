"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { ShoppingBag, Users, Loader2, CheckCircle, Gem } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoleSelector({ isChangingRole = false }: { isChangingRole?: boolean }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState<"member" | "organizer" | null>(null)

  const handleSelect = async (role: "member" | "organizer") => {
    setIsSubmitting(role)

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          ...(role === "organizer" ? { groupName: "Mi Espacio" } : { skipGroup: true }),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Error al configurar tu perfil")
      }

      localStorage.removeItem("costack_welcome_panel")

      router.push(ROUTES.suscripciones)
    } catch (error: any) {
      console.error(error)
      setIsSubmitting(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
            {isChangingRole ? 'Cambiar de rol' : <>Bienvenido a <span className="text-cyan-400">Co</span><span className="text-white">Stack</span></>}
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            {isChangingRole
              ? 'Elegí cómo querés usar CoStack a partir de ahora. Esto no afecta tus compras anteriores.'
              : 'Elegí cómo querés usar la plataforma. Siempre podés cambiar después.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Buyer */}
          <button
            onClick={() => handleSelect("member")}
            disabled={isSubmitting !== null}
            className={cn(
              "group relative flex flex-col items-center text-center p-10 rounded-3xl border border-white/5 bg-white/[0.02] transition-all duration-300",
              "hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] hover:-translate-y-1",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              isSubmitting === "member" && "ring-2 ring-emerald-500/50"
            )}
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Comprar una licencia más barata</h2>
            <p className="text-zinc-400 leading-relaxed mb-8 max-w-sm">
              Accedé a herramientas como Canva, GitHub Copilot o Figma a precio reducido. Compartís el costo con otros usuarios, pero tu trabajo queda privado. Ideal si trabajás solo.
            </p>
            <div className="mt-auto">
              {isSubmitting === "member" ? (
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Configurando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold group-hover:bg-emerald-500/20 transition-colors">
                  Ver herramientas disponibles
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </div>
          </button>

          {/* Card: Organizer */}
          <button
            onClick={() => handleSelect("organizer")}
            disabled={isSubmitting !== null}
            className={cn(
              "group relative flex flex-col items-center text-center p-10 rounded-3xl border border-white/5 bg-white/[0.02] transition-all duration-300",
              "hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] hover:-translate-y-1",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              isSubmitting === "organizer" && "ring-2 ring-cyan-500/50"
            )}
          >
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative">
              <Users className="w-10 h-10 text-cyan-400" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Gem className="w-3 h-3" /> +1
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ser el encargado de una licencia</h2>
            <p className="text-zinc-400 leading-relaxed mb-8 max-w-sm">
              Iniciás la compra de la licencia, otros se suman y dividen el costo. Todos acceden al mismo precio reducido. Por ser el primero, ganás <strong className="text-cyan-400">1 Coin CoStack</strong> como incentivo.
            </p>
            <div className="mt-auto">
              {isSubmitting === "organizer" ? (
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando espacio...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-semibold group-hover:bg-cyan-500/20 transition-colors">
                  Configurar espacio de equipo
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
