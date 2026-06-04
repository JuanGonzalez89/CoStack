import Link from "next/link"
import { KeyRound, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SeatAccessCardData } from "@/features/dashboard/contracts"
import { cn } from "@/lib/utils"

const stateStyles = {
  current: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  overdue: "bg-amber-400/10 text-amber-100 border-amber-400/20",
  blocked: "bg-red-400/10 text-red-100 border-red-400/20",
}


export function SeatAccessCard({ accessState, groupName, accessToken }: SeatAccessCardData) {
  const maskedToken = `${accessToken.slice(0, 4)}•${accessToken.slice(-4)}`

  return (
    <section className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-zinc-50">{groupName}</h3>
          <p className="mt-1 text-base text-zinc-400">Código de invitación del grupo</p>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider", stateStyles[accessState])}>
          <ShieldCheck size={14} />
          {accessState === "current" ? "Activo" : accessState === "overdue" ? "Bloqueado" : "Inactivo"}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex-1 rounded-2xl border border-white/5 bg-black/40 px-6 py-5 flex items-center justify-between">
          <span className="font-mono text-2xl font-bold text-cyan-400 tracking-wider">
            {accessToken}
          </span>
          <Button 
            variant="ghost" 
            className="text-zinc-400 hover:text-white hover:bg-white/10"
            onClick={() => {
              navigator.clipboard.writeText(accessToken)
            }}
          >
            Copiar
          </Button>
        </div>

        <Button asChild className="w-full rounded-2xl h-14 bg-white text-black hover:bg-zinc-200 font-bold text-base">
          <Link href="/settings/grupo">Administrar Grupo</Link>
        </Button>
      </div>
    </section>
  )
}