"use client"

import { MessageCircle, HelpCircle, ShieldCheck, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AyudaView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-400">Ayuda</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Centro de soporte</h1>
        <p className="text-sm text-zinc-400 mt-1">Hablá con nosotros o encontrá respuestas rápidas.</p>
      </div>

      <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          Hablá con nosotros
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Escribinos por WhatsApp. Te responde un desarrollador de CoStack en minutos. No es un bot, es asistencia real.
        </p>

        <a
          href="https://wa.me/5491144276384"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp +54 11 4427-6384
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>

        <p className="text-xs text-zinc-500 text-center">
          Lunes a viernes 9 a 19hs (ARG). Fin de semana respondemos apenas podemos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={ShieldCheck} title="Pago protegido" desc="Si no podés acceder en 24hs, te devolvemos todo." />
        <InfoCard icon={Clock} title="Soporte real" desc="Hablamos con vos, no con un bot automático." />
      </div>

      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Preguntas frecuentes
        </h2>

        <div className="space-y-3">
          <Faq q="¿Cómo funciona la sala de espera?" a="Pagás tu cupo y esperás a que se completen todos los asientos. Cuando se llena, la licencia se activa y recibís tu código de acceso al instante. Si en 24hs no se completa, te devolvemos el 100%." />
          <Faq q="¿Cuánto tarda en activarse la licencia?" a="Depende de cuánto tarde en llenarse la sala. En el peor de los casos, 24 horas. En el mejor, unos minutos. Vas a ver el progreso en tiempo real desde el dashboard." />
          <Faq q="¿Cómo uso mi código de acceso?" a="Cuando la sala se completa, te aparece una notificación. Hacé clic en tu suscripción desde el Dashboard y vas a ver el código y las instrucciones paso a paso." />
          <Faq q="¿Puedo cancelar después de pagar?" a="Si salís del grupo antes de fin de mes, no se reembolsa el período en curso porque la licencia es compartida. Pero antes de pagar, podés cancelar en cualquier momento." />
        </div>
      </div>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <p className="text-sm font-semibold text-white mb-1.5">{q}</p>
      <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
    </div>
  )
}

function InfoCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
