"use client"

import { useState, useEffect } from "react"
import { OnboardingTour } from "@/components/dashboard/onboarding-tour"
import { RoleGuideModal } from "@/components/dashboard/role-guide-modal"

interface OnboardingSequenceProps {
  isOrganizer: boolean
}

export function OnboardingSequence({ isOrganizer }: OnboardingSequenceProps) {
  const [showRoleGuide, setShowRoleGuide] = useState(false)

  useEffect(() => {
    const tourKey = "costack_tour_seen"
    const roleKey = `costack_role_guide_${isOrganizer ? "org" : "member"}`

    const tourSeen = localStorage.getItem(tourKey)
    const roleSeen = localStorage.getItem(roleKey)

    if (tourSeen && roleSeen) return

    if (roleSeen && !tourSeen) {
      localStorage.removeItem(roleKey)
    }

    if (!tourSeen && !roleSeen) {
      localStorage.removeItem(tourKey)
      localStorage.removeItem(roleKey)
    }
  }, [isOrganizer])

  const handleTourComplete = () => {
    const roleKey = `costack_role_guide_${isOrganizer ? "org" : "member"}`
    const alreadySeen = localStorage.getItem(roleKey)
    if (!alreadySeen) {
      setTimeout(() => setShowRoleGuide(true), 400)
    }
  }

  return (
    <>
      <OnboardingTour onComplete={handleTourComplete} />
      <RoleGuideModal
        isOrganizer={isOrganizer}
        open={showRoleGuide}
        onClose={() => setShowRoleGuide(false)}
      />
    </>
  )
}
