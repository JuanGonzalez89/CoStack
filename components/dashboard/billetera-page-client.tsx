"use client"

import { useState } from "react"
import { AccessRevokedScreen } from "@/components/dashboard/access-revoked-screen"
import { BilleteraView } from "@/components/dashboard/billetera-view"
import { PaymentFailureModal } from "@/components/dashboard/payment-failure-modal"
import { PaymentRetryBanner } from "@/components/dashboard/payment-retry-banner"

interface PaymentData {
  id: string
  amount: number
  status: string
  createdAt: string
  description: string
  toolName: string
}

interface BilleteraPageClientProps {
  isOverdue: boolean
  isOrganizer: boolean
  initialPayments: PaymentData[]
  balance: number
  nextCharge: number
}

export function BilleteraPageClient({ isOverdue, isOrganizer, initialPayments, balance, nextCharge }: BilleteraPageClientProps) {
  const [failureOpen, setFailureOpen] = useState(isOverdue)

  if (isOverdue) {
    return (
      <div className="space-y-6">
        <PaymentRetryBanner
          href="/suscripciones"
          title="Tu acceso quedó en pausa por un pago vencido"
          description="Reintentá el pago o actualizá tu medio de pago para recuperar tu acceso."
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

  return <BilleteraView isOrganizer={isOrganizer} initialPayments={initialPayments} balance={balance} nextCharge={nextCharge} />
}