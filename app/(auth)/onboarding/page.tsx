import { DemoSessionForm } from '@/components/auth/demo-session-form'

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Onboarding</p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Definí el grupo antes de entrar al dashboard.</h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Sprint 1 requiere que el usuario tenga grupo activo para llegar al dashboard. Acá se simula ese paso, que luego va a convertirse en un flujo real de creación o invitación.
          </p>
        </section>

        <DemoSessionForm
          title="Completar onboarding"
          description="Marcá el grupo como activo para desbloquear el dashboard."
          submitLabel="Finalizar onboarding"
          defaultRole="organizer"
          defaultGroup="active"
          defaultPayment="current"
          fixedGroup="active"
        />
      </div>
    </div>
  )
}