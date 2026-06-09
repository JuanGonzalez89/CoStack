"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Armchair, CreditCard, LayoutDashboard, Users, Wallet, LogOut } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import type { NavTab } from "./sidebar"

const navItems: { label: NavTab; shortLabel: string; href: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { label: "Dashboard", shortLabel: "Inicio", href: ROUTES.overview, icon: LayoutDashboard },
  { label: "Suscripciones", shortLabel: "Catálogo", href: ROUTES.suscripciones, icon: CreditCard },
  { label: "Gestión de cupos", shortLabel: "Cupos", href: ROUTES.asientos, icon: Armchair, adminOnly: true },
  { label: "Comunidad Freelance", shortLabel: "Comunidad", href: ROUTES.comunidad, icon: Users },
  { label: "Billetera", shortLabel: "Billetera", href: ROUTES.billetera, icon: Wallet },
]

export function MobileNav({ 
  isOrganizer = false,
  user
}: { 
  isOrganizer?: boolean
  user?: { name: string; email: string }
}) {
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">Sistema activo</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-cyan-500/20 hover:bg-rose-500/20 text-cyan-400 hover:text-rose-400 transition-colors group"
            title="Cerrar sesión"
          >
            <span className="text-xs font-bold group-hover:hidden">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
            <LogOut size={14} className="hidden group-hover:block" />
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#0f172a] px-2 py-2 lg:hidden">
        {navItems.filter(item => !item.adminOnly || isOrganizer).map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false)

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
