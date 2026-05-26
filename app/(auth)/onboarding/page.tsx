import { AuthJourneyForm } from '@/components/auth/auth-journey-form'

export default function OnboardingPage() {
  return (
    <div className="w-full">
      <AuthJourneyForm
        mode="onboarding"
        title="Completar onboarding"
        description="Definí el grupo real antes de entrar al dashboard."
        submitLabel="Finalizar onboarding"
      />
    </div>
  )
}