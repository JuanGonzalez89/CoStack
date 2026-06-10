"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface NotificationItem {
  id: string
  message: string
  lobbyId: string
  read: boolean
  createdAt: string
}

const POLL_INTERVAL = 5_000

export function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkRead = async (lobbyId: string) => {
    try {
      await fetch(`/api/lobby/${lobbyId}/notification`, { method: "PATCH" })
      setUnreadCount(0)
      setNotifications((prev) =>
        prev.map((n) => (n.lobbyId === lobbyId ? { ...n, read: true } : n)),
      )
    } catch {
      // silent
    }
  }

  const handleClick = async (n: NotificationItem) => {
    if (!n.read) {
      await handleMarkRead(n.lobbyId)
    }
    setOpen(false)
    router.push("/overview")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          "absolute mt-2 w-80 rounded-2xl border border-white/10 bg-zinc-950 shadow-xl overflow-hidden z-50",
          align === "left" ? "left-0" : "right-0"
        )}>
          <div className="p-3 border-b border-white/5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notificaciones</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors",
                    !n.read && "bg-cyan-500/5",
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    !n.read ? "bg-emerald-500/10" : "bg-white/5",
                  )}>
                    <CheckCircle2 className={cn(
                      "w-4 h-4",
                      !n.read ? "text-emerald-400" : "text-zinc-500",
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !n.read ? "text-white font-semibold" : "text-zinc-300",
                    )}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-zinc-500">
                No tenés notificaciones
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
