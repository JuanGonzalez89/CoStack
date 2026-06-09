import Link from 'next/link'
import { Rocket, Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OnboardingPrompt({ isOrganizer = false }: { isOrganizer?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.02] p-10 sm:p-16 text-center shadow-lg">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Rocket size={200} />
      </div>
      
      <div className="relative z-10 max-w-xl mx-auto">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Rocket size={40} />
        </div>
        
        <h2 className="mb-4 text-3xl font-bold text-white tracking-tight">
          {isOrganizer ? '¡Bienvenido a CoStack Studio!' : '¡Bienvenido a tu espacio CoStack!'}
        </h2>
        <p className="mb-10 text-base text-zinc-400 leading-relaxed">
          {isOrganizer 
            ? 'Para comenzar a rentabilizar tus licencias, añade la herramienta que quieres compartir con tu equipo y te daremos un código de invitación.'
            : 'Aún no tienes licencias activas asignadas. Únete a un espacio privado usando un código de acceso o encuentra grupos con cupos libres en Automatch.'}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isOrganizer ? (
            <Button asChild className="w-full sm:w-auto rounded-xl bg-cyan-500 px-8 h-14 text-base font-bold text-white hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              <Link href="/suscripciones">
                <Plus size={20} className="mr-2" />
                + Nueva Suscripción
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild className="w-full sm:w-auto rounded-xl bg-cyan-500 px-8 h-14 text-base font-bold text-white hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <Link href="/onboarding?mode=join">
                  <UserPlus size={20} className="mr-2" />
                  Ingresar Código
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-8 h-14 text-base font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
                <Link href="/comunidad">
                  Explorar Automatch
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
