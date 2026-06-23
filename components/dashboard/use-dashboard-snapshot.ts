"use client"

import { useEffect, useState } from "react"
import type { DashboardSnapshot } from "@/lib/dashboard-snapshot"

export function useDashboardSnapshot() {
  const [data, setData] = useState<DashboardSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/dashboard/snapshot", { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Snapshot request failed: ${response.status}`)
        }

        const snapshot = (await response.json()) as DashboardSnapshot
        setData(snapshot)
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setError("No pudimos cargar los datos persistidos.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSnapshot()

    return () => controller.abort()
  }, [])

  return { data, isLoading, error }
}