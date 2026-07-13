"use client"

import { User, Shield, CreditCard, Mail, HelpCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ActiveSub {
  toolName: string
  amount: number
  date: string
  renewDate: string
}

interface SettingsPageClientProps {
  userName: string
  userEmail: string
  userRole: string
  subscriptionsCount: number
  activeSubscriptions: ActiveSub[]
}

export function SettingsPageClient({ userName, userEmail, userRole, subscriptionsCount, activeSubscriptions }: SettingsPageClientProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-400">Ajustes</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Configuración de cuenta</h1>
        <p className="text-sm text-zinc-400 mt-1">Administrá tu perfil y suscripciones.</p>
      </div>

      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          Perfil
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Nombre</p>
            <p className="text-white font-medium">{userName}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Email</p>
            <p className="text-white font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {userEmail}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Rol</p>
            <p className="text-white font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              {userRole === 'organizer' ? 'Organizador' : 'Miembro'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Suscripciones activas</p>
            <p className="text-white font-medium">{subscriptionsCount}</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          Suscripciones activas
        </h2>
        {activeSubscriptions.length > 0 ? (
          <div className="space-y-3">
            {activeSubscriptions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-white font-medium text-sm">{sub.toolName}</p>
                  <p className="text-xs text-zinc-500">Renueva el {new Date(sub.renewDate).toLocaleDateString('es-AR')}</p>
                </div>
                <span className="text-emerald-400 font-bold">${formatCurrency(sub.amount)}/mes</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No tenés suscripciones activas todavía.</p>
        )}
      </div>

      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Ayuda
        </h2>
        <p className="text-sm text-zinc-400">
          ¿Tenés algún problema con tu suscripción o credenciales? Escribinos a{" "}
          <a href="mailto:soporte@costack.app" className="text-cyan-400 hover:underline">soporte@costack.app</a>{" "}
          y te respondemos a la brevedad.
        </p>
        <div className="text-sm text-zinc-500 space-y-1">
          <p>🔹 Si tu credencial no funciona, verificá que la copiaste exactamente.</p>
          <p>🔹 Los códigos de acceso vencen a los 30 días junto con tu licencia.</p>
          <p>🔹 Si querés cancelar, escribinos desde este mismo formulario.</p>
        </div>
      </div>
    </div>
  )
}
