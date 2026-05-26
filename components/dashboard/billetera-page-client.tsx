"use client"

import { useState } from "react"
import { AccessRevokedScreen } from "@/components/dashboard/access-revoked-screen"
import { BilleteraView } from "@/components/dashboard/billetera-view"
import { PaymentFailureModal } from "@/components/dashboard/payment-failure-modal"
import { PaymentRetryBanner } from "@/components/dashboard/payment-retry-banner"

interface BilleteraPageClientProps {
  isOverdue: boolean
}

export function BilleteraPageClient({ isOverdue }: BilleteraPageClientProps) {
  const [failureOpen, setFailureOpen] = useState(isOverdue)

  if (isOverdue) {
    return (
      <div className="space-y-6">
        <PaymentRetryBanner
          onRetry={() => setFailureOpen(true)}
          title="Tu acceso quedó en pausa por un pago vencido"
          description="Reintentá el pago o actualizá tu medio de pago para liberar el asiento y restaurar el acceso ciego."
        />
        <AccessRevokedScreen />
        <PaymentFailureModal
          open={failureOpen}
          onOpenChange={setFailureOpen}
          toolName="ChatGPT Team Workspace"
          amount="$30.00"
          onRetry={() => setFailureOpen(false)}
        />
      </div>
    )
  }

  return <BilleteraView />
}