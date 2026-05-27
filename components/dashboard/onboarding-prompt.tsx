import Link from 'next/link'
import { Rocket, Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OnboardingPrompt() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 sm:p-12 text-center shadow-lg">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Rocket size={180} />
      </div>
      
      <div className="relative z-10 max-w-lg mx-auto">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
          <Rocket size={32} />
        </div>
        
        <h2 className="mb-3 text-2xl font-bold text-zinc-50 tracking-tight">¡Bienvenido a CoStack!</h2>
        <p className="mb-8 text-sm text-zinc-400 leading-relaxed">
          Todavía no eres parte de ninguna herramienta compartida. Para empezar a gestionar tus gastos y compartir asientos, crea tu propio grupo o únete a uno existente usando un código de invitación.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="w-full sm:w-auto rounded-xl bg-sky-500 px-6 py-6 text-sm font-bold text-white hover:bg-sky-400 transition-colors shadow-sm">
            <Link href="/onboarding/herramienta">
              <Plus size={18} className="mr-2" />
              Crear mi primer grupo
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl border border-zinc-700 bg-transparent px-6 py-6 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">
            <Link href="/onboarding/unirse">
              <UserPlus size={18} className="mr-2" />
              Tengo un código
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
