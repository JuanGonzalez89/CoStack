'use client'

import dynamic from 'next/dynamic'
import { Spotlight } from "@/components/ui/spotlight"
import { Loader2 } from 'lucide-react'

const SplineScene = dynamic(
  () => import("@/components/ui/splite").then(mod => mod.SplineScene),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    )
  }
)
 
export function InteractiveFeature() {
  return (
    <section className="px-6 md:px-12 py-16">
      <div className="w-full max-w-6xl mx-auto h-[500px] bg-[#0a0f1e] border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#06b6d4" // cyan-500 equivalent
        />
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-xs font-semibold text-cyan-400 tracking-wide w-fit uppercase">
              Interactividad Total
            </div>
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 leading-tight">
              Control <span className="text-cyan-400">dinámico</span> de cupos
            </h2>
            <p className="mt-4 text-slate-400 max-w-md leading-relaxed">
              Descubre una forma completamente inmersiva de visualizar quién tiene acceso a cada herramienta. Administra credenciales y actualízalas en tiempo real.
            </p>
          </div>

          {/* Right content */}
          <div className="flex-1 relative min-h-[300px]">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
