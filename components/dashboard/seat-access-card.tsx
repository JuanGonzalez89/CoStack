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
    <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Acceso ciego</p>
          <h3 className="mt-1 text-xl font-bold text-zinc-50">{groupName}</h3>
          <p className="mt-1 text-sm text-slate-300">El miembro recibe un token temporal. La credencial maestra no se expone.</p>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", stateStyles[accessState])}>
          <ShieldCheck size={12} />
          {accessState === "current" ? "Al día" : accessState === "overdue" ? "En gracia" : "Bloqueado"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <KeyRound size={12} />
            Token temporal
          </div>
          <p className="mt-2 font-mono text-sm text-zinc-50">{maskedToken}</p>
        </div>

        <Button asChild className="rounded-xl bg-cyan-500 text-white hover:bg-cyan-400">
          <Link href="/settings/grupo">Administrar grupo</Link>
        </Button>
      </div>
    </section>
  )
}