import { DemoSessionForm } from '@/components/auth/demo-session-form'

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Registro</p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Prepará la sesión base del miembro antes de pasar por onboarding.</h2>
          <p className="max-w-xl text-base text-muted-foreground">
            El alta todavía no persiste un usuario real, pero deja listo el camino para roles, grupo y estado de pago sin romper la estructura del App Router.
          </p>
        </section>

        <DemoSessionForm
          title="Crear cuenta"
          description="Inicializá la sesión demo de registro para continuar al onboarding."
          submitLabel="Continuar"
          defaultRole="member"
          defaultGroup="none"
          defaultPayment="current"
        />
      </div>
    </div>
  )
}