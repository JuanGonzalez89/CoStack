"use client"

import { useState } from "react"
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal"
import { SeatAccessCard } from "@/components/dashboard/seat-access-card"
import { Button } from "@/components/ui/button"

export default function GroupSettingsPage() {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Espacio</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Gestión del espacio</h1>
          <p className="text-sm text-muted-foreground">Acceso reservado para administradores.</p>
        </div>

        <Button className="rounded-xl bg-cyan-500 text-white hover:bg-cyan-400" onClick={() => setInviteOpen(true)}>
          Invitar miembro
        </Button>
      </div>

      <SeatAccessCard
        accessState="current"
        groupName="CoStack Studio"
        accessToken="COSTACK-74A2-9X11"
      />

      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Acá van a vivir precios, miembros, herramientas y permisos. Ya quedó listo el punto de entrada para invitar gente y mostrar acceso protegido.
      </div>

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        groupName="CoStack Studio"
      />
    </section>
  )
}