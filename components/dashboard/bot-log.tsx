import { Bot, Wifi } from "lucide-react"
import { cn, now } from "@/lib/utils"

export interface LogEntry {
  time: string
  message: string
  type: "info" | "success" | "action"
}

const initialLogs: LogEntry[] = [
  { time: "14:28", message: "OpenClaw Bot conectado al servidor. Escuchando eventos de pago.", type: "info" },
  { time: "14:29", message: "Verificación de asientos completada. 8/10 ocupados.", type: "info" },
  { time: "14:30", message: "Pago recibido de Santiago Gómez. Liberando 1 asiento para Figma Organization.", type: "success" },
  { time: "14:31", message: "OpenClaw Bot envió enlace de invitación privado a Santiago Gómez.", type: "action" },
]

const typeStyles: Record<LogEntry["type"], string> = {
  info: "text-slate-400",
  success: "text-cyan-400",
  action: "text-emerald-400",
}

const typePrefixes: Record<LogEntry["type"], string> = {
  info: "[INFO]",
  success: "[PAGO]",
  action: "[BOT] ",
}

export function BotLog({ entries, limit = 3 }: { entries: LogEntry[]; limit?: number }) {
  const allLogs = (entries.length > 0 ? entries : initialLogs).slice(0, limit)
  const cursorTime = now()

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-50">Log de Actividad del Bot</h2>
          <p className="mt-0.5 text-xs text-slate-300">Acciones en tiempo real del agente OpenClaw</p>
        </div>
        {/* Online indicator */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Bot size={13} className="text-emerald-300" />
          <span className="text-xs font-semibold text-emerald-100">OpenClaw: Online</span>
          <Wifi size={12} className="text-emerald-300" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
        {/* Terminal top bar */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="ml-3 font-mono text-xs text-slate-400">openclaw-bot ~ activity-log</span>
        </div>

        {/* Log lines */}
        <div className="max-h-56 space-y-2 overflow-y-auto p-4 font-mono text-xs">
          {allLogs.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 transition-all duration-300",
                i === allLogs.length - 1 && "animate-pulse-once"
              )}
            >
              <span className="shrink-0 tabular-nums text-slate-500">{entry.time}</span>
              <span className={cn("shrink-0 font-semibold", typeStyles[entry.type])}>
                {typePrefixes[entry.type]}
              </span>
              <span className="leading-relaxed text-slate-200">{entry.message}</span>
            </div>
          ))}
          {/* Blinking cursor */}
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-slate-500">{cursorTime ?? "--:--"}</span>
            <span className="text-cyan-500 font-semibold">[SYS] </span>
            <span className="text-slate-400">
              Esperando eventos
              <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-500/70 animate-pulse align-middle" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
