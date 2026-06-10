"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ToolCard } from '@/components/dashboard/tool-card'
import type { ToolCardData } from '@/features/dashboard/contracts'
import { EmptyState } from '@/components/dashboard/empty-state'
import { PackageOpen } from 'lucide-react'
import { SubscriptionDetailModal } from '@/components/suscripciones/subscription-detail-modal'
import { LobbyView } from '@/components/dashboard/lobby-view'
import { SalaEsperaIntro } from '@/components/dashboard/sala-espera-intro'

export function ToolCards({ tools, isOrganizer = false, initialLobbyId = null }: { tools: ToolCardData[], isOrganizer?: boolean, initialLobbyId?: string | null }) {
  const router = useRouter()
  const [selectedTool, setSelectedTool] = useState<ToolCardData | null>(null)
  const [introTool, setIntroTool] = useState<ToolCardData | null>(null)
  const [lobbyTool, setLobbyTool] = useState<ToolCardData | null>(null)

  useEffect(() => {
    if (initialLobbyId) {
      const match = tools.find(t => t.lobbyId === initialLobbyId)
      if (match) setIntroTool(match)
    }
  }, [initialLobbyId, tools])

  const handleSelect = (tool: ToolCardData) => {
    if (tool.status === 'lobby') {
      setIntroTool(tool)
    } else {
      setSelectedTool(tool)
    }
  }

  const handleOpenLobby = (tool: ToolCardData) => {
    if (isOrganizer && tool.lobbyId) {
      router.push(`/lobby/${tool.lobbyId}`)
    } else {
      setIntroTool(tool)
    }
  }

  const handleIntroConfirm = () => {
    const tool = introTool
    setIntroTool(null)
    if (tool) setLobbyTool(tool)
  }

  return (
    <>
      <SubscriptionDetailModal
        tool={selectedTool}
        accessToken={selectedTool?.accessToken}
        open={!!selectedTool}
        onOpenChange={(open) => { if (!open) setSelectedTool(null) }}
      />

      <SalaEsperaIntro
        tool={introTool!}
        open={!!introTool}
        onConfirm={handleIntroConfirm}
        onClose={() => setIntroTool(null)}
      />

      <LobbyView
        tool={lobbyTool!}
        open={!!lobbyTool}
        onOpenChange={(open) => { if (!open) setLobbyTool(null) }}
      />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Suscripciones Activas</h2>
            <p className="mt-1 text-sm text-zinc-400">Hacé clic en una suscripción para ver los detalles</p>
          </div>
          <Button asChild className="rounded-xl h-12 bg-white text-black hover:bg-zinc-200 font-bold text-sm px-6 shadow-none">
            <Link href="/suscripciones">+ Nueva Suscripción</Link>
          </Button>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={handleSelect} onOpenLobby={handleOpenLobby} isOrganizer={isOrganizer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageOpen}
            variant="action"
            title="Todavía no hay herramientas cargadas"
            description="Cuando exista una herramienta activa, las suscripciones y cupos aparecerán acá con una acción clara para continuar."
            actionButton={{ label: 'Ir al catálogo', href: '/suscripciones' }}
            secondaryCta={{ label: 'Tengo un código', href: '/onboarding' }}
          />
        )}
      </section>
    </>
  )
}
