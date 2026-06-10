"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SeatRow } from "./seat-row"
import { ConfigCredentialsModal } from "./config-credentials-modal"
import { CancelLicenseModal } from "./cancel-license-modal"
import type { StatusBadgeStatus } from "@/features/dashboard/contracts"
import type { DashboardSnapshot } from "@/lib/dashboard-snapshot"

interface GestionAsientosViewProps {
  snapshot: DashboardSnapshot
}

export function GestionAsientosView({ snapshot }: GestionAsientosViewProps) {
  const [automatchEnabled, setAutomatchEnabled] = useState(true)
  const isOrganizer = true
  const groups = snapshot.activeGroups ?? []
  const seats = groups.flatMap(g => g.seats ?? [])
  const payments = groups.flatMap(g => g.payments ?? [])

  // Agrupar asientos por herramienta
  const groupedSeats = seats.reduce((acc, seat) => {
    const key = seat.tool.name
    if (!acc[key]) {
      acc[key] = {
        name: seat.tool.name,
        provider: seat.tool.provider,
        iconLabel: seat.tool.name.substring(0, 3).toUpperCase(),
        iconBg: "bg-cyan-500/10",
        iconText: "text-cyan-500",
        seats: []
      }
    }
    
    // Buscar pago asociado
    const payment = payments.find(p => p.toolId === seat.toolId && p.userId === seat.assigneeId)
    
    acc[key].seats.push({
      name: seat.status === 'free' ? 'Asiento Libre' : (payment?.user?.name || payment?.user?.email || 'Usuario asignado'),
      email: payment?.user?.email || '',
      status: seat.status as StatusBadgeStatus | 'free'
    })
    
    return acc
  }, {} as Record<string, any>)

  const tools = Object.values(groupedSeats)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Gestión de Asientos</h2>
        <p className="text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Administrá el acceso a tus herramientas. Cada asiento representa un cupo pago. Cuando todos los asientos estén ocupados, recuperarás el monto total invertido en la licencia.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)] items-start">
        <div className="space-y-6">
          {tools.length === 0 ? (
            <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-12 text-center">
              <p className="text-zinc-400 text-lg">Aún no hay herramientas configuradas en este espacio.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tools.map((tool) => {
                const occupiedCount = tool.seats.filter((s: any) => s.status !== "free").length
                const totalSeats = tool.seats.length
                
                return (
                  <div key={tool.name} className="bg-white/[0.02] rounded-[24px] border border-white/5 shadow-sm overflow-hidden transition-all hover:bg-white/[0.04]">
                    {/* Header limpio */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.01] gap-4">
                      <div className="flex items-center gap-5">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold border border-white/10 shadow-sm", tool.iconBg, tool.iconText)}>
                          {tool.iconLabel}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{tool.name}</p>
                          <p className="text-sm font-semibold text-cyan-400">{tool.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                        <Users size={16} />
                        <span className="text-sm font-bold">{occupiedCount}/{totalSeats} en uso</span>
                      </div>
                    </div>

                    {/* Lista humana, sin encabezados de base de datos */}
                    <div className="divide-y divide-white/5 p-4">
                      {tool.seats.map((seat: any, i: number) => (
                        <SeatRow 
                          key={i} 
                          name={seat.name} 
                          status={seat.status} 
                          email={seat.email}
                          isOrganizer={isOrganizer}
                        />
                      ))}
                    </div>

                    {/* Acciones de Administrador */}
                    <div className="p-4 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <ConfigCredentialsModal toolName={tool.name}>
                        <button className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-zinc-200 hover:bg-white/5 transition-colors">
                          <span className="mr-2">🔑</span> Configurar Credenciales
                        </button>
                      </ConfigCredentialsModal>
                      
                      <CancelLicenseModal toolName={tool.name}>
                        <button className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                          <span className="mr-2">✕</span> Cancelar Licencia
                        </button>
                      </CancelLicenseModal>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6 sticky top-24">
          <div className="rounded-[24px] border border-cyan-500/20 bg-cyan-500/5 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-xl">🤝</span>
                Llenado Automático
              </h3>
              <button 
                onClick={() => setAutomatchEnabled(!automatchEnabled)}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950",
                  automatchEnabled ? "bg-cyan-500" : "bg-zinc-700"
                )}
              >
                <span 
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                    automatchEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <p className="text-base text-zinc-300 leading-relaxed mb-4">
              ¿Te sobran lugares? No busques gente manualmente. Nuestro sistema <strong className="text-cyan-400">Automatch</strong> conecta a usuarios de la comunidad con tus cupos vacíos automáticamente para que recuperes tu inversión más rápido.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/20 border border-white/5 text-sm font-semibold">
              <span className={automatchEnabled ? "text-cyan-400" : "text-zinc-500"}>
                {automatchEnabled ? "● Automatch Activado" : "○ Pausado (Grupo Privado)"}
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-2">Código Privado</h3>
            <p className="text-base text-zinc-400 mb-6">Compartí este código exclusivo con tu equipo para que se unan a tu grupo privado.</p>
            
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center mb-6">
              <span className="font-mono text-3xl font-bold text-cyan-400 tracking-wider">
                {snapshot.activeGroups?.[0]?.inviteCode ?? 'COSTACK-84A2'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <h4 className="text-lg font-bold text-violet-300 mb-3 flex items-center gap-2">
                <span className="text-2xl">💼</span> Licencias Business
              </h4>
              <p className="text-sm text-violet-100 mb-3 leading-relaxed">
                Herramientas corporativas (como Figma o Vercel) tienen una forma distinta de invitar:
              </p>
              <ul className="space-y-2 text-sm text-violet-200/80 list-disc pl-5">
                <li>No usan contraseñas compartidas.</li>
                <li>Los miembros te pedirán acceso a través de la plataforma.</li>
                <li>CoStack recolecta sus correos automáticamente para que los invites desde el panel oficial de la herramienta.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-xl">🛡️</span>
              Pagos 100% Seguros
            </h3>
            <div className="space-y-4 text-base text-zinc-300 leading-relaxed">
              <p>
                Como Organizador, no corres riesgos de impagos. Nuestro sistema Escrow te protege:
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex gap-3">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span>Los invitados nos pagan la cuota a nosotros primero.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span>Retenemos los fondos de forma segura (Escrow).</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span>Vos les pasás el acceso y nosotros te liberamos el dinero.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
