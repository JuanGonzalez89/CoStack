"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Armchair, CreditCard, LayoutDashboard, Users, Wallet } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import type { NavTab } from "./sidebar"

const navItems: { label: NavTab; shortLabel: string; href: string; icon: React.ElementType }[] = [
  { label: "Dashboard", shortLabel: "Inicio", href: ROUTES.overview, icon: LayoutDashboard },
  { label: "Suscripciones", shortLabel: "Catálogo", href: ROUTES.suscripciones, icon: CreditCard },
  { label: "Gestión de Asientos", shortLabel: "Asientos", href: ROUTES.asientos, icon: Armchair },
  { label: "Comunidad Freelance", shortLabel: "Comunidad", href: ROUTES.comunidad, icon: Users },
  { label: "Billetera", shortLabel: "Billetera", href: ROUTES.billetera, icon: Wallet },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-4 py-3 lg:hidden">
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
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-400">Bot Online</span>
          <div className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20">
            <span className="text-xs font-bold text-cyan-400">M</span>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#0f172a] px-2 py-2 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all">
              <item.icon size={20} className={cn(isActive ? 'text-cyan-400' : 'text-slate-500')} />
              <span className={cn('text-[10px] font-medium', isActive ? 'text-cyan-400' : 'text-slate-500')}>
                {item.shortLabel}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
