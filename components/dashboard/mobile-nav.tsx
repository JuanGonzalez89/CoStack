"use client"

import Image from "next/image"
import { LayoutDashboard, CreditCard, Armchair, Users, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NavTab } from "./sidebar"

const navItems: { label: NavTab; shortLabel: string; icon: React.ElementType }[] = [
  { label: "Dashboard", shortLabel: "Inicio", icon: LayoutDashboard },
  { label: "Suscripciones", shortLabel: "Catálogo", icon: CreditCard },
  { label: "Gestión de Asientos", shortLabel: "Asientos", icon: Armchair },
  { label: "Comunidad Freelance", shortLabel: "Comunidad", icon: Users },
  { label: "Billetera", shortLabel: "Billetera", icon: Wallet },
]

interface MobileNavProps {
  activeTab: NavTab
  onNavChange: (tab: NavTab) => void
}

export function MobileNav({ activeTab, onNavChange }: MobileNavProps) {
  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-white/10 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <Image
            src="/CoStack_Logo.png"
            alt="Logo de CoStack"
            width={38}
            height={38}
            className="h-[38px] w-[38px] object-contain"
            priority
          />
          <span className="text-lg font-bold">
            <span className="text-white">Co</span>
            <span className="text-cyan-400">Stack</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Bot Online</span>
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center ml-2">
            <span className="text-cyan-400 font-bold text-xs">M</span>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-white/10 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.label
          return (
            <button
              key={item.label}
              onClick={() => onNavChange(item.label)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
            >
              <item.icon
                size={20}
                className={cn(isActive ? "text-cyan-400" : "text-slate-500")}
              />
              <span className={cn("text-[10px] font-medium", isActive ? "text-cyan-400" : "text-slate-500")}>
                {item.shortLabel}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
