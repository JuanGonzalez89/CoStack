import { AuthJourneyForm } from '@/components/auth/auth-journey-form'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const intent = resolvedSearchParams?.mode === 'join' ? 'join' : resolvedSearchParams?.mode === 'create' ? 'create' : undefined

  const title = intent === 'join' ? 'Continuar con un código' : intent === 'create' ? 'Continuar al catálogo' : 'Completar onboarding'
  const description =
    intent === 'join'
      ? 'Ingresa tu código de invitación para reservar tu lugar y seguir con el flujo.'
      : intent === 'create'
        ? 'Completa este paso para seguir al catálogo y elegir tu herramienta.'
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