import Link from 'next/link'
import { DollarSign, ShoppingBag, ArrowRight, Check } from 'lucide-react'

export function OnboardingPrompt({ isOrganizer }: { isOrganizer?: boolean }) {
  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          ¿Qué querés hacer hoy?
        </h2>
        <p className="text-zinc-400 text-base max-w-xl mx-auto">
          CoStack tiene dos caminos. Elegí el que te aplica — podés usar los dos después.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* === CARD A: COMPRAR (Miembro) === */}
        <Link
          href="/suscripciones"
          className="group flex flex-col rounded-[24px] border border-white/5 bg-zinc-900/40 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300 overflow-hidden"
        >
          {/* Color bar */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />

          <div className="p-8 flex flex-col flex-1">
            {/* Icon + Label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <ShoppingBag size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Para ti</p>
                <h3 className="text-xl font-bold text-white leading-tight">Acceder a software</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Pagás solo tu parte de una licencia compartida. Acceso real, precio de fracción.
            </p>

            {/* Example prices */}
            <div className="space-y-2 mb-6">
              {[
                { tool: 'ChatGPT Team', full: '$30', you: '$6' },
                { tool: 'Canva Pro', full: '$30', you: '$6' },
                { tool: 'GitHub Copilot', full: '$10', you: '$2.50' },
              ].map((ex) => (
                <div key={ex.tool} className="flex items-center justify-between text-xs bg-black/20 rounded-xl px-4 py-2.5 border border-white/5">
                  <span className="text-zinc-300 font-medium">{ex.tool}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 line-through">{ex.full}</span>
                    <span className="text-cyan-400 font-bold">{ex.you}/mes</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div className="flex items-start gap-2 text-xs text-zinc-500 mb-6">
              <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Pago único mensual. Acceso asegurado por 30 días.</span>
            </div>

            <div className="mt-auto flex items-center text-cyan-400 font-bold text-sm group-hover:translate-x-1.5 transition-transform">
              Ver licencias disponibles <ArrowRight size={16} className="ml-1.5" />
            </div>
          </div>
        </Link>

        {/* === CARD B: COMPARTIR (Organizador) === */}
        <Link
          href="/suscripciones"
          className="group flex flex-col rounded-[24px] border border-white/5 bg-zinc-900/40 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 overflow-hidden"
        >
          {/* Color bar */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />

          <div className="p-8 flex flex-col flex-1">
            {/* Icon + Label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Tenés una cuenta</p>
                <h3 className="text-xl font-bold text-white leading-tight">Recuperar lo que gastás</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Ya pagás Canva, ChatGPT o Copilot y querés que otros cubran parte del costo. CoStack llena tus cupos automáticamente y te deposita el dinero mes a mes.
            </p>

            {/* Example earnings */}
            <div className="space-y-2 mb-6">
              {[
                { tool: 'ChatGPT Team (5 cupos)', earn: 'Hasta $24/mes' },
                { tool: 'Canva Pro (5 cupos)', earn: 'Hasta $24/mes' },
                { tool: 'GitHub Copilot (4 cupos)', earn: 'Hasta $8/mes' },
              ].map((ex) => (
                <div key={ex.tool} className="flex items-center justify-between text-xs bg-black/20 rounded-xl px-4 py-2.5 border border-white/5">
                  <span className="text-zinc-300 font-medium">{ex.tool}</span>
                  <span className="text-emerald-400 font-bold">{ex.earn}</span>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div className="flex items-start gap-2 text-xs text-zinc-500 mb-6">
              <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Solo publicás tus credenciales. CoStack hace el match automático.</span>
            </div>

            <div className="mt-auto flex items-center text-emerald-400 font-bold text-sm group-hover:translate-x-1.5 transition-transform">
              Publicar mi cuenta <ArrowRight size={16} className="ml-1.5" />
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-xs text-zinc-600 pt-2">
        No estás comprometido a nada. Podés explorar ambas opciones libremente.
      </p>
    </div>
  )
}
