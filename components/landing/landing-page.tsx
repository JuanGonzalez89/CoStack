import Link from "next/link"
import Image from "next/image"
import { Shield, Users, ArrowRight, Bot, CreditCard, Lock, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroRobotScene } from "@/components/landing/hero-robot-scene"

const features = [
  { icon: ShoppingBag, title: "Licencias a precio compartido", desc: "Pagás solo una fracción del costo real. Misma herramienta, menor precio." },
  { icon: Users, title: "Salas de espera transparentes", desc: "Ves cuántos cupos faltan en tiempo real. Cuando se completa, la licencia se activa al instante." },
  { icon: Bot, title: "Activación automática", desc: "Al completar los cupos, recibís tu código de acceso sin hacer nada más." },
  { icon: Shield, title: "Pago 100% protegido", desc: "Si la sala no se completa en 24 horas, te devolvemos todo automáticamente." },
  { icon: CreditCard, title: "Precio claro, sin letra chica", desc: "Ves cuánto pagás por tu cupo antes de confirmar. Sin costos ocultos." },
  { icon: Lock, title: "Datos seguros", desc: "Tu cuenta y pagos se gestionan con sesiones seguras. Sin compartir tu información." },
]

const logos = ["ChatGPT", "Figma", "Midjourney", "GitHub", "Vercel", "Notion", "Canva", "Slack"]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex-1 flex items-center gap-2.5">
          <Image src="/CoStack_Logo.png" alt="Logo" width={36} height={36} className="h-9 w-9 object-contain" priority />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Co</span><span className="text-cyan-400">Stack</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Funciones</a>
          <a href="#tools" className="hover:text-white transition-colors">Herramientas</a>
          <a href="#cta" className="hover:text-white transition-colors">Empezar</a>
        </div>
        <div className="flex-1" />
      </nav>

      {/* ── Hero ── */}
      <HeroRobotScene />

      {/* ── Tool logos ── */}
      <section id="tools" className="border-y border-white/5 bg-white/[0.01] py-8 px-6">
        <p className="text-center text-xs text-zinc-500 uppercase tracking-widest mb-6 font-semibold">Herramientas disponibles</p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {logos.map((name) => (
            <span key={name} className="text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-default">{name}</span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Pagá menos, accedé igual</h2>
            <p className="mt-3 text-zinc-400 text-base max-w-lg mx-auto">
              Comprás un cupo en una licencia compartida. Cuando se completan todos los cupos, la licencia se activa y vos ya podés usar la herramienta.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent px-8 md:px-14 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Empezá a ahorrar en tus herramientas</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto text-base">Elegí una herramienta, pagá tu cupo y esperá en la sala. Sin vueltas.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" className="w-full sm:w-auto px-10 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl gap-2 transition-all duration-200 shadow-lg shadow-cyan-500/20" asChild>
              <Link href="/register">Crear cuenta gratis <ArrowRight size={16} /></Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 border-zinc-700 text-zinc-300 bg-transparent hover:bg-white/5 hover:border-zinc-500 font-bold rounded-xl" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <span>© 2026 CoStack — Licencias compartidas, claras y simples.</span>
      </footer>
    </div>
  )
}
