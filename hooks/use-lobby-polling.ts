"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface LobbyMemberData {
  seatIndex: number
  amount: number
  email?: string
  name?: string
  isSelf?: boolean
}

export interface LobbyStatus {
  id: string
  status: "waiting" | "processing" | "completed" | "expired"
  filledSeats: number
  totalSeats: number
  expiresAt: string
  accessToken?: string
  creatorId?: string
  isCreator?: boolean
  members: LobbyMemberData[]
  toolName?: string
  provider?: string
  pricePerSeat?: number
  message?: string
}

interface NotificationItem {
  id: string
  message: string
  lobbyId: string
  read: boolean
  createdAt: string
}

interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
}

const POLL_INTERVAL = 5_000

export function useLobbyPolling(lobbyId: string | null) {
  const [data, setData] = useState<LobbyStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationsResponse>({
    notifications: [],
    unreadCount: 0,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchLobby = useCallback(async () => {
    if (!lobbyId) return
    try {
      const res = await fetch(`/api/lobby/${lobbyId}`)
      if (!res.ok) throw new Error("Failed to fetch lobby")
      const json: LobbyStatus = await res.json()
      setData(json)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al obtener la sala")
    }
  }, [lobbyId])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const json: NotificationsResponse = await res.json()
      setNotifications(json)
    } catch {
      // silent
    }
  }, [])

  const markNotificationRead = useCallback(async (lobbyId: string) => {
    try {
      await fetch(`/api/lobby/${lobbyId}/notification`, { method: "PATCH" })
      setNotifications((prev) => ({
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map((n) =>
          n.lobbyId === lobbyId ? { ...n, read: true } : n,
        ),
      }))
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (!lobbyId) return

    fetchLobby()
    fetchNotifications()

    intervalRef.current = setInterval(() => {
      fetchLobby()
      fetchNotifications()
    }, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [lobbyId, fetchLobby, fetchNotifications])

  return { data, error, notifications, markNotificationRead }
}
