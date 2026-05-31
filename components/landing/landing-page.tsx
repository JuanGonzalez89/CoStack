import Link from "next/link"
import Image from "next/image"
import { Zap, Shield, Users, ArrowRight, Bot, CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroRobotScene } from "@/components/landing/hero-robot-scene"

const features = [
  {
    icon: CreditCard,
    title: "Precio claro por persona",
    desc: "Ves cuanto pagas por tu cupo antes de confirmar, sin letra chica.",
  },
  {
    icon: Users,
    title: "Cupos disponibles al instante",
    desc: "Encuentra licencias con lugar libre y evita perder tiempo en opciones cerradas.",
  },
  {
    icon: Bot,
    title: "Activacion rapida",
    desc: "Tras confirmar tu pago, sigues un flujo guiado hasta ver tu acceso listo.",
  },
  {
    icon: Shield,
    title: "Compra con confianza",
    desc: "Reglas de acceso y estado de pago visibles para que sepas siempre en que etapa estas.",
  },
  {
    icon: Zap,
    title: "Recorrido simple",
    desc: "Descubrir, comparar, reservar y pagar en pocos pasos.",
  },
  {
    icon: Lock,
    title: "Datos protegidos",
    desc: "Tu cuenta y tu acceso se gestionan con sesiones seguras y control por usuario.",
  },
]

const logos = ["ChatGPT", "Figma", "Midjourney", "GitHub", "Vercel", "Notion", "Canva", "Slack"]

export function LandingPage({ hasSession = false }: { hasSession?: boolean }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Image
            src="/CoStack_Logo.png"
            alt="Logo de CoStack"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Co</span>
            <span className="text-cyan-400">Stack</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Funciones</a>
          <a href="#tools" className="hover:text-white transition-colors">Herramientas</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
        </div>
        <div className="flex items-center gap-3">
          {hasSession ? (
            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl gap-1.5 shadow-lg shadow-cyan-500/20" asChild>
              <Link href="/suscripciones">
                Ir al Catálogo
                <ArrowRight size={14} />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl gap-1.5 shadow-lg shadow-cyan-500/20" asChild>
                <Link href="/register">
                  Registrarse
                  <ArrowRight size={14} />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <HeroRobotScene />

      {/* ── Logo cloud ── */}
      <section id="tools" className="border-y border-white/5 bg-white/[0.02] py-8 px-6">
        <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-6 font-semibold">
          Herramientas soportadas
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {logos.map((name) => (
            <span key={name} className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-default">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
              Todo lo que necesitas para pagar menos y entrar rapido
            </h2>
            <p className="mt-3 text-slate-400 text-base max-w-lg mx-auto">
              CoStack te guía desde la búsqueda de licencias hasta el acceso activo, sin lenguaje técnico innecesario.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA banner ── */}
      <section id="pricing" className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto rounded-3xl border border-cyan-500/20 bg-cyan-500/5 px-8 md:px-14 py-14 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12),transparent_70%)]" />
          <h2 className="relative text-2xl md:text-3xl font-bold text-white text-balance mb-3">
            Encuentra tu licencia y activa tu acceso hoy
          </h2>
          <p className="relative text-slate-400 mb-8 max-w-md mx-auto">
            Entra, compara opciones por precio y cupos, confirma tu pago y sigue un flujo que se entiende de principio a fin.
          </p>
          <div className="relative flex flex-col sm:flex-row justify-center gap-4">
            {hasSession ? (
              <Button size="lg" className="px-10 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl gap-2 shadow-xl shadow-cyan-500/25 hover:scale-105 transition-all duration-200" asChild>
                <Link href="/suscripciones">
                  Ir al Catálogo
                  <ArrowRight size={16} />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="px-10 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl gap-2 shadow-xl shadow-cyan-500/25 hover:scale-105 transition-all duration-200" asChild>
                  <Link href="/login">
                    Iniciar Sesión
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-10 border-slate-600 text-slate-200 bg-transparent hover:bg-white/5 hover:border-slate-400 font-bold rounded-xl" asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Image
            src="/CoStack_Logo.png"
            alt="Logo de CoStack"
            width={18}
            height={18}
            className="h-[18px] w-[18px] object-contain"
          />
          <span className="font-semibold text-slate-300">CoStack</span>
          <span>— Licencias compartidas, claras y simples</span>
        </div>
        <span>© 2026 CoStack. Todos los derechos reservados.</span>
      </footer>
    </div>
  )
}
