import { DemoSessionForm } from '@/components/auth/demo-session-form'

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">Acceso</p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">Ingresá con una sesión de demo para validar el flujo protegido.</h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Este login todavía no usa un proveedor real de auth. Sirve para probar middleware, onboarding y redirecciones por estado mientras se define Clerk o NextAuth.
          </p>
        </section>

        <DemoSessionForm
          title="Iniciar sesión"
          description="Configurá la sesión demo para entrar al dashboard y validar rutas protegidas."
          submitLabel="Entrar"
          defaultRole="member"
          defaultGroup="none"
          defaultPayment="current"
        />
      </div>
    </div>
  )
}