"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

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

function now(): string {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

export function BotLog({ extraLogs }: { extraLogs: LogEntry[] }) {
  const allLogs = [...initialLogs, ...extraLogs]
  const bottomRef = useRef<HTMLDivElement>(null)
  const [cursorTime, setCursorTime] = useState<string | null>(null)

  useEffect(() => {
    setCursorTime(now())
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [extraLogs])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Log de Actividad del Bot</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Acciones en tiempo real del agente OpenClaw</p>
        </div>
        {/* Online indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Bot size={13} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">OpenClaw: Online</span>
          <Wifi size={12} className="text-emerald-500" />
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
        {/* Terminal top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.03]">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="ml-3 text-xs text-slate-500 font-mono">openclaw-bot ~ activity-log</span>
        </div>

        {/* Log lines */}
        <div className="p-4 space-y-2 font-mono text-xs min-h-[200px] max-h-72 overflow-y-auto">
          {allLogs.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 transition-all duration-300",
                i === allLogs.length - 1 && extraLogs.length > 0 && "animate-pulse-once"
              )}
            >
              <span className="text-slate-600 shrink-0 tabular-nums">{entry.time}</span>
              <span className={cn("shrink-0 font-semibold", typeStyles[entry.type])}>
                {typePrefixes[entry.type]}
              </span>
              <span className="text-slate-300 leading-relaxed">{entry.message}</span>
            </div>
          ))}
          {/* Blinking cursor */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 tabular-nums">{cursorTime ?? "--:--"}</span>
            <span className="text-cyan-500 font-semibold">[SYS] </span>
            <span className="text-slate-500">
              Esperando eventos
              <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-500/70 animate-pulse align-middle" />
            </span>
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  )
}

export { now }
