"use client"

import { useState, useEffect } from "react"
import { HelpCircle } from "lucide-react"
import { ScreenTour } from "@/components/dashboard/screen-tour"
import { WelcomePanel } from "@/components/dashboard/welcome-panel"

export function HelpButton({ isOrganizer }: { isOrganizer: boolean }) {
  const [showTour, setShowTour] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("costack_welcome_panel")
    if (!seen) {
      const t = setTimeout(() => setShowTour(true), 1000)
      return () => clearTimeout(t)
    }
  }, [])

  const handleTourComplete = () => {
    setShowTour(false)
    setTimeout(() => setShowPanel(true), 300)
  }

  const handlePanelClose = () => {
    localStorage.setItem("costack_welcome_panel", "true")
    setShowPanel(false)
  }

  return (
    <>
      <button
        onClick={() => setShowTour(true)}
        className="fixed top-4 right-4 z-40 h-9 w-9 rounded-full border border-white/10 bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-lg"
        title="Ayuda"
      >
        <HelpCircle size={17} />
      </button>

      <ScreenTour
        open={showTour}
        onComplete={handleTourComplete}
        onClose={() => { setShowTour(false); handlePanelClose() }}
      />

      <WelcomePanel
        isOrganizer={isOrganizer}
        open={showPanel}
        onClose={handlePanelClose}
      />
    </>
  )
}
