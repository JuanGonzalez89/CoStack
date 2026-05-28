import { AuthJourneyForm } from '@/components/auth/auth-journey-form'

export default function OnboardingPage({
  searchParams,
}: {
  searchParams?: { mode?: string }
}) {
  const intent = searchParams?.mode === 'join' ? 'join' : searchParams?.mode === 'create' ? 'create' : undefined

  const title = intent === 'join' ? 'Unirte con codigo' : intent === 'create' ? 'Crear tu primer grupo' : 'Completar onboarding'
  const description =
    intent === 'join'
      ? 'Ingresa tu codigo de invitacion para reservar tu lugar y continuar al pago.'
      : intent === 'create'
        ? 'Define el nombre de tu grupo para empezar a buscar licencias y compartir cupos.'
        : 'Completa este paso para entrar al flujo de compra.'

  return (
    <div className="w-full">
      <AuthJourneyForm
        mode="onboarding"
        onboardingIntent={intent}
        title={title}
        description={description}
        submitLabel={intent === 'join' ? 'Continuar' : 'Guardar y continuar'}
      />
    </div>
  )
}