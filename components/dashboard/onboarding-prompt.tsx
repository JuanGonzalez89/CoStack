import Link from 'next/link'
import { Rocket, Plus, Search, DollarSign, PiggyBank } from 'lucide-react'

export function OnboardingPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Rocket size={40} />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
          Bienvenido a CoStack
        </h2>
        <p className="text-lg text-zinc-400 leading-relaxed">
          La plataforma Zero Friction para compartir y acceder a licencias premium. 
          ¿Qué te gustaría hacer hoy?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Tarjeta Miembro */}
        <Link href="/suscripciones" className="group relative rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 p-8 sm:p-10 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 overflow-hidden text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <PiggyBank size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <Search size={24} />
              </span>
              <h3 className="text-2xl font-bold text-white">Acceder a software</h3>
            </div>
            <p className="text-zinc-300 mb-8 min-h-[60px]">
              Encuentra cupos libres en licencias compartidas y accede a herramientas premium por una fracción de su precio original.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between rounded-xl bg-black/40 p-4 border border-emerald-500/10">
                <span className="text-zinc-400">Precio oficial ChatGPT</span>
                <span className="text-zinc-500 line-through font-mono">$30/mes</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                <span className="text-emerald-100 font-medium">En CoStack</span>
                <span className="text-emerald-400 font-bold font-mono">$6/mes</span>
              </div>
            </div>

            <div className="inline-flex items-center justify-center w-full rounded-xl bg-emerald-500 px-6 py-4 text-sm font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:bg-emerald-400 transition-colors">
              Explorar Catálogo
            </div>
          </div>
        </Link>

        {/* Tarjeta Organizador */}
        <Link href="/suscripciones" className="group relative rounded-[32px] border border-cyan-500/20 bg-cyan-500/5 p-8 sm:p-10 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30 overflow-hidden text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
                <Plus size={24} />
              </span>
              <h3 className="text-2xl font-bold text-white">Recuperar inversión</h3>
            </div>
            <p className="text-zinc-300 mb-8 min-h-[60px]">
              ¿Tienes una licencia premium que no usas al 100%? Compártela de forma segura y recupera el dinero que invertiste.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between rounded-xl bg-black/40 p-4 border border-cyan-500/10">
                <span className="text-zinc-400">Gasto en licencias</span>
                <span className="text-red-400 font-mono">-$50/mes</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-cyan-500/10 p-4 border border-cyan-500/20">
                <span className="text-cyan-100 font-medium">Ganancias recuperadas</span>
                <span className="text-cyan-400 font-bold font-mono">+$40/mes</span>
              </div>
            </div>

            <div className="inline-flex items-center justify-center w-full rounded-xl bg-cyan-500 px-6 py-4 text-sm font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:bg-cyan-400 transition-colors">
              Compartir Herramienta
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
