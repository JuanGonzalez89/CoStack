"use client"

import { useState, useCallback } from "react"
import { Bell, Bot } from "lucide-react"
import { LandingPage } from "@/components/landing/landing-page"
import { Sidebar, type NavTab } from "@/components/dashboard/sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { ToolCards } from "@/components/dashboard/tool-cards"
import { BotLog, type LogEntry, now } from "@/components/dashboard/bot-log"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { BilleteraView } from "@/components/dashboard/billetera-view"
import { GestionAsientosView } from "@/components/dashboard/gestion-asientos-view"
import { SuscripcionesView } from "@/components/dashboard/suscripciones-view"
import { ComunidadView } from "@/components/dashboard/comunidad-view"

type AppView = "Landing" | NavTab

const viewTitles: Record<NavTab, { title: string; subtitle: string }> = {
  Dashboard: { title: "Gestión de Licencias", subtitle: "Panel de control · Mayo 2026" },
  Suscripciones: { title: "Suscripciones", subtitle: "Catálogo de herramientas disponibles" },
  "Gestión de Asientos": { title: "Gestión de Asientos", subtitle: "Estado de ocupación del equipo" },
  "Comunidad Freelance": { title: "Comunidad Freelance", subtitle: "Comparte, co-financia y conecta" },
  Billetera: { title: "Billetera", subtitle: "Balance y transacciones" },
}

export default function App() {
  const [appView, setAppView] = useState<AppView>("Landing")
  const [activeTab, setActiveTab] = useState<NavTab>("Dashboard")
  const [extraLogs, setExtraLogs] = useState<LogEntry[]>([])

  const handleBotLog = useCallback((message: string) => {
    setExtraLogs((prev) => [
      ...prev,
      {
        time: now(),
        message,
        type: message.startsWith("[BOT]")
          ? "action"
          : message.startsWith("Pago recibido")
          ? "success"
          : "info",
      },
    ])
  }, [])

  const enterApp = useCallback(() => {
    setAppView("Dashboard")
    setActiveTab("Dashboard")
  }, [])

  const handleNavChange = useCallback((tab: NavTab) => {
    setActiveTab(tab)
    setAppView(tab)
  }, [])

  // ── Landing ──────────────────────────────────────────────
  if (appView === "Landing") {
    return <LandingPage onEnterApp={enterApp} />
  }

  // ── Dashboard shell ──────────────────────────────────────
  const { title, subtitle } = viewTitles[activeTab]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onNavChange={handleNavChange} />

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} onNavChange={handleNavChange} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-card border-b border-border sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bot status badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Bot size={13} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Bot OpenClaw: Online</span>
            </div>

            {/* Notification Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-colors">
              <Bell size={16} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 border-2 border-card" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center">
                <span className="text-sm font-bold text-cyan-600">M</span>
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Martín Pérez
                </p>
                <p className="text-xs text-muted-foreground">Miembro</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8 space-y-6 overflow-y-auto mt-14 lg:mt-0">
          {activeTab === "Dashboard" && (
            <>
              <SummaryCards />
              <ToolCards onBotLog={handleBotLog} />
              <BotLog extraLogs={extraLogs} />
            </>
          )}

          {activeTab === "Suscripciones" && <SuscripcionesView />}

          {activeTab === "Gestión de Asientos" && <GestionAsientosView />}

          {activeTab === "Comunidad Freelance" && <ComunidadView />}

          {activeTab === "Billetera" && <BilleteraView />}
        </div>
      </main>
    </div>
  )
}
