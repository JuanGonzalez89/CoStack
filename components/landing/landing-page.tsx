"use client"

import { Layers, Zap, Shield, Users, ArrowRight, Bot, CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Bot,
    title: "Bot de Acceso Automático",
    desc: "OpenClaw gestiona credenciales y envía invitaciones por DM sin intervención humana.",
  },
  {
    icon: CreditCard,
    title: "Pagos Compartidos Sin Fricción",
    desc: "Divide el costo de licencias enterprise entre tu equipo. Cada quien paga su parte, punto.",
  },
  {
    icon: Shield,
    title: "Acceso Ciego y Seguro",
    desc: "Nadie ve las credenciales maestras. El bot es el único que las maneja.",
  },
  {
    icon: Users,
    title: "Gestión de Asientos en Tiempo Real",
    desc: "Visualiza quién ocupa qué asiento y libera plazas con un clic.",
  },
  {
    icon: Zap,
    title: "Renovaciones Automáticas",
    desc: "El sistema cobra y renueva antes del vencimiento. Sin deudas, sin cortes de servicio.",
  },
  {
    icon: Lock,
    title: "Privacidad Total",
    desc: "Cada miembro accede solo a lo que pagó. Nada más, nada menos.",
  },
]

const logos = ["ChatGPT", "Figma", "Midjourney", "GitHub", "Vercel", "Notion", "Canva", "Slack"]

interface LandingPageProps {
  onEnterApp: () => void
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
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
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl"
            onClick={onEnterApp}
          >
            Iniciar Sesión
          </Button>
          <Button
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl gap-1.5 shadow-lg shadow-cyan-500/20"
            onClick={onEnterApp}
          >
            Registrarse
            <ArrowRight size={14} />
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-28 md:pt-32 md:pb-36 overflow-hidden">
        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(6,182,212,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial fade from center */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, #0a0f1e 100%)" }}
        />
        {/* Cyan glow blob */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Plataforma para equipos freelance
        </div>

        {/* Headline */}
        <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance max-w-4xl leading-[1.05]">
          <span className="text-white">CoStack: </span>
          <span className="text-cyan-400">El Administrador</span>
          <br className="hidden sm:block" />
          <span className="text-white"> Invisible de Software</span>
        </h1>

        {/* Sub-headline */}
        <p className="relative mt-6 text-base md:text-lg text-slate-400 max-w-xl leading-relaxed text-pretty">
          Automatiza pagos y accesos para equipos freelance.
          <br className="hidden sm:block" />
          Sin fricción, sin deudas.
        </p>

        {/* CTAs */}
        <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl gap-2 shadow-xl shadow-cyan-500/25 text-base transition-all duration-200 hover:scale-105"
            onClick={onEnterApp}
          >
            Iniciar Sesión
            <ArrowRight size={16} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 border-slate-600 text-slate-200 bg-transparent hover:bg-white/5 hover:border-slate-400 font-bold rounded-xl gap-2 text-base transition-all duration-200"
            onClick={onEnterApp}
          >
            Registrarse
          </Button>
        </div>

        {/* Social proof */}
        <p className="relative mt-8 text-xs text-slate-500">
          Más de <span className="text-slate-300 font-semibold">2,400 freelancers</span> ya comparten licencias en CoStack
        </p>
      </section>

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
              Todo lo que necesita tu equipo
            </h2>
            <p className="mt-3 text-slate-400 text-base max-w-lg mx-auto">
              CoStack maneja lo tedioso para que puedas enfocarte en el trabajo real.
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
            Empieza a compartir sin drama
          </h2>
          <p className="relative text-slate-400 mb-8 max-w-md mx-auto">
            Crea tu equipo, invita a tus colegas y deja que OpenClaw haga el resto.
          </p>
          <div className="relative flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="px-10 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl gap-2 shadow-xl shadow-cyan-500/25 hover:scale-105 transition-all duration-200"
              onClick={onEnterApp}
            >
              Iniciar Sesión
              <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-10 border-slate-600 text-slate-200 bg-transparent hover:bg-white/5 hover:border-slate-400 font-bold rounded-xl"
              onClick={onEnterApp}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          <span className="font-semibold text-slate-300">CoStack</span>
          <span>— Administrador Invisible de Software</span>
        </div>
        <span>© 2026 CoStack. Todos los derechos reservados.</span>
      </footer>
    </div>
  )
}
