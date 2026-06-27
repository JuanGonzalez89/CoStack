"use client"

import { useState } from "react"
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal"
import { Button } from "@/components/ui/button"
import { Copy, Check, Users } from "lucide-react"
import { toast } from "sonner"

interface MemberData {
  name: string | null
  email: string
  role: string
}

interface GroupSettingsClientProps {
  groupId: string
  groupName: string
  inviteCode: string
  members: MemberData[]
}

export function GroupSettingsClient({ groupId, groupName, inviteCode, members }: GroupSettingsClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    toast.success("Código de invitación copiado")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-400">Espacio</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Gestión del espacio</h1>
          <p className="text-sm text-zinc-400">Acceso reservado para administradores.</p>
        </div>

        <Button className="rounded-xl bg-cyan-500 text-white hover:bg-cyan-400" onClick={() => setInviteOpen(true)}>
          Invitar miembro
        </Button>
      </div>

      {/* Código de invitación */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <h3 className="font-semibold text-white">Código de invitación del grupo</h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-cyan-400 font-mono text-lg font-bold tracking-wider">
            {inviteCode}
          </code>
          <Button
            variant="outline"
            className="rounded-xl border-white/10 text-zinc-300 hover:text-white"
            onClick={copyInviteCode}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-zinc-500">Compartí este código con otros miembros para que se unan al grupo.</p>
      </div>

      {/* Miembros */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Miembros ({members.length})
          </h3>
        </div>
        <div className="space-y-2">
          {members.map((member, i) => (
            <div
              key={`${member.email}-${i}`}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {(member.name || member.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{member.name || member.email.split("@")[0]}</p>
                  <p className="text-xs text-zinc-500">{member.email}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                member.role === 'organizer'
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'bg-zinc-500/10 text-zinc-400'
              }`}>
                {member.role === 'organizer' ? 'Admin' : 'Miembro'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        groupName={groupName}
      />
    </section>
  )
}