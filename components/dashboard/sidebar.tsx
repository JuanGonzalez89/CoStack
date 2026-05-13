"use client"

import {
  LayoutDashboard,
  CreditCard,
  Armchair,
  Users,
  Wallet,
  Layers,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NavTab = "Dashboard" | "Suscripciones" | "Gestión de Asientos" | "Comunidad Freelance" | "Billetera"

const navItems: { label: NavTab; icon: React.ElementType; badge?: string; dot?: boolean }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Suscripciones", icon: CreditCard },
  { label: "Gestión de Asientos", icon: Armchair, badge: "8/10" },
  { label: "Comunidad Freelance", icon: Users },
  { label: "Billetera", icon: Wallet },
]

interface SidebarProps {
  activeTab: NavTab
  onNavChange: (tab: NavTab) => void
}

export function Sidebar({ activeTab, onNavChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen bg-[#0f172a] text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
          <Layers className="w-5 h-5 text-cyan-400" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Co</span>
          <span className="text-cyan-400">Stack</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Principal
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.label
          return (
            <button
              key={item.label}
              onClick={() => onNavChange(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                )}
                size={18}
              />
              <span className="flex-1 text-left">{item.label}</span>

              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 leading-none">
                  {item.badge}
                </span>
              )}
              {item.dot && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {isActive && <ChevronRight size={14} className="text-cyan-500/60" />}
            </button>
          )
        })}

        <div className="pt-4">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Configuración
          </p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
            <Settings size={18} className="text-slate-500" />
            <span>Ajustes</span>
          </button>
        </div>
      </nav>

      {/* User profile */}
      <div className="px-3 pb-5 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
            <span className="text-cyan-400 font-bold text-sm">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">Martín Pérez</p>
            <p className="text-xs text-slate-500 truncate">martin@costack.io</p>
          </div>
          <LogOut size={15} className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
        </div>
      </div>
    </aside>
  )
}
