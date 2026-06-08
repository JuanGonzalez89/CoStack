import Link from "next/link"
import { CheckCircle2, ArrowRight, MailOpen, Lock } from "lucide-react"
import { CATALOG_TOOLS } from "@/components/dashboard/suscripciones-view"
import { redirect } from "next/navigation"

export default function CheckoutSuccessPage({ params }: { params: { toolSlug: string } }) {
  const tool = CATALOG_TOOLS.find(t => t.id === params.toolSlug)

  if (!tool) {
    redirect('/suscripciones')
  }

  return (
    <div className="max-w-2xl mx-auto pt-10 pb-20 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center text-center">
        {/* Animated Check Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 relative z-10">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          ¡Pago Confirmado!
        </h1>
        
        <p className="text-lg text-zinc-400 mb-10 max-w-lg">
          Tu acceso a <strong className="text-white">{tool.name}</strong> ha sido asegurado con éxito. Ya eres oficialmente parte del pool de licencias.
        </p>

        {/* Dynamic Next Steps Card based on tool type */}
        <div className="w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 mb-10 text-left shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${tool.isBusiness ? 'bg-violet-500' : 'bg-cyan-500'}`} />
          
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            {tool.isBusiness ? (
              <><MailOpen className="w-6 h-6 text-violet-400" /> ¿Qué sigue ahora?</>
            ) : (
              <><Lock className="w-6 h-6 text-cyan-400" /> ¿Qué sigue ahora?</>
            )}
          </h3>

          <div className="space-y-4">
            {tool.isBusiness ? (
              <>
                <p className="text-zinc-300">
                  Como <strong>{tool.name}</strong> es una herramienta de uso corporativo, no usamos contraseñas compartidas.
                </p>
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-5 mt-4">
                  <p className="text-violet-200 font-medium">
                    Te hemos enviado una invitación oficial a tu correo. Revisa tu bandeja de entrada en los próximos minutos para aceptar la invitación y unirte al espacio de trabajo.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-zinc-300">
                  Tus credenciales compartidas ya están listas y encriptadas en tu cuenta de CoStack.
                </p>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 mt-4">
                  <p className="text-cyan-200 font-medium">
                    Ve a tu Dashboard para revelar la contraseña y empezar a usar la herramienta inmediatamente.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link 
          href="/overview"
          className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95"
        >
          Ir a mis credenciales <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
