"use client"

import { useEffect, useState } from "react"
import { Copy, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
}

function createInviteCode() {
  return `COSTACK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function InviteMemberModal({ open, onOpenChange, groupName }: InviteMemberModalProps) {
  const [inviteCode, setInviteCode] = useState(createInviteCode())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setInviteCode(createInviteCode())
      setCopied(false)
    }
  }, [open])

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
            <Users size={18} />
          </div>
          <DialogTitle className="text-xl">Invitar persona al espacio</DialogTitle>
          <DialogDescription className="text-sm">
            Generá un código de acceso para sumar gente a <span className="font-semibold text-foreground">{groupName}</span> sin exponer credenciales maestras.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Código de acceso</p>
              <p className="mt-1 text-lg font-bold text-foreground">{inviteCode}</p>
            </div>
            <div className="rounded-full bg-cyan-100 p-2 text-cyan-600">
              <Sparkles size={16} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button className="rounded-xl bg-cyan-500 text-white hover:bg-cyan-400" onClick={handleCopy}>
            <Copy size={14} />
            {copied ? "Copiado" : "Copiar acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}