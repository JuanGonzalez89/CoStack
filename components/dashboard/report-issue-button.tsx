"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ReportIssueButtonProps {
  seatId: string
}

export function ReportIssueButton({ seatId }: ReportIssueButtonProps) {
  const [isReporting, setIsReporting] = useState(false)

  const handleReport = async () => {
    if (!window.confirm("¿Seguro que quieres reportar este acceso? Esto congelará los pagos al organizador mientras revisamos el caso.")) {
      return
    }

    setIsReporting(true)
    try {
      const res = await fetch('/api/dashboard/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, reason: "La cuenta dejó de funcionar o los datos son inválidos." })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Hubo un error al reportar el problema.")
      }

      toast.success(data.message || "Problema reportado exitosamente.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
      onClick={handleReport}
      disabled={isReporting}
    >
      {isReporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <AlertTriangle className="w-4 h-4 mr-2" />
      )}
      Reportar problema
    </Button>
  )
}
