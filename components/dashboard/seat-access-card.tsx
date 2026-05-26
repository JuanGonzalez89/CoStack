import Link from "next/link"
import { KeyRound, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SeatAccessCardProps {
  accessState: "current" | "overdue" | "blocked"
  groupName: string
  accessToken: string
}

const stateStyles = {
  current: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-amber-100 text-amber-700 border-amber-200",
  blocked: "bg-red-100 text-red-700 border-red-200",
}

export function SeatAccessCard({ accessState, groupName, accessToken }: SeatAccessCardProps) {
  const maskedToken = `${accessToken.slice(0, 4)}•${accessToken.slice(-4)}`

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Acceso ciego</p>
          <h3 className="mt-1 text-xl font-bold text-foreground">{groupName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">El miembro recibe un token temporal. La credencial maestra no se expone.</p>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", stateStyles[accessState])}>
          <ShieldCheck size={12} />
          {accessState === "current" ? "Al día" : accessState === "overdue" ? "En gracia" : "Bloqueado"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <KeyRound size={12} />
            Token temporal
          </div>
          <p className="mt-2 font-mono text-sm text-foreground">{maskedToken}</p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/settings/grupo">Administrar grupo</Link>
        </Button>
      </div>
    </section>
  )
}