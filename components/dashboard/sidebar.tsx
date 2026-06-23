"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  ChevronRight,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants/routes"
import { NotificationBell } from "./notification-bell"

export type NavTab = "Dashboard" | "Suscripciones" | "Comunidad Freelance" | "Billetera" | "Ayuda"

export function Sidebar({ 
  isOrganizer = false,
  activeSubscriptionsCount = 0,
  nextRenewalLabel = null,
  user 
}: { 
  isOrganizer?: boolean
  activeSubscriptionsCount?: number
  nextRenewalLabel?: string | null
  user?: { name: string; email: string }
}) {
  const navItems: { label: NavTab; href: string; icon: React.ElementType; badge?: string; adminOnly?: boolean; dot?: boolean }[] = [
    { label: "Dashboard", href: ROUTES.overview, icon: LayoutDashboard },
    { label: "Suscripciones", href: ROUTES.suscripciones, icon: CreditCard, badge: String(activeSubscriptionsCount) },
    { label: "Billetera", href: ROUTES.billetera, icon: Wallet },
    { label: "Ayuda", href: ROUTES.ayuda, icon: HelpCircle },
  ]
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen bg-black border-r border-white/5 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/5">
        <Image
          src="/CoStack_Logo.png"
          alt="Logo de CoStack"
          width={44}
          height={44}
          className="h-11 w-11 object-contain"
          priority
        />
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Co</span>
          <span className="text-cyan-400">Stack</span>
        </span>
        <div className="ml-auto">
          <NotificationBell align="left" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Principal
        </p>
        {navItems.filter(item => !item.adminOnly || isOrganizer).map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false)
          return (
            <Link
              key={item.label}
              href={item.href}
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
                <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 leading-none whitespace-nowrap">
                  <span>{item.badge}</span>
                  {nextRenewalLabel && item.label === 'Suscripciones' && (
                    <span className="text-[9px] text-cyan-400/60 font-normal">· renueva {nextRenewalLabel}</span>
                  )}
                </span>
              )}
              {item.dot && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {isActive && <ChevronRight size={14} className="text-cyan-500/60" />}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Configuración
          </p>
          <Link href={ROUTES.settings} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
            <Settings size={18} className="text-slate-500" />
            <span>Ajustes</span>
          </Link>
        </div>
      </nav>

      {/* User profile */}
      <div className="px-3 pb-5 border-t border-white/5 pt-4">
        <div 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
          title="Cerrar sesión"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
            <span className="text-cyan-400 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
          </div>
          <LogOut size={15} className="text-slate-600 group-hover:text-rose-400 shrink-0 transition-colors" />
        </div>
      </div>
    </aside>
  )
}
