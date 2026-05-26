import { AuthJourneyForm } from '@/components/auth/auth-journey-form'

export default function RegisterPage() {
  return (
    <div className="w-full">
      <AuthJourneyForm
        mode="register"
        title="Crear cuenta"
        description="Registrate con tus datos reales."
        submitLabel="Crear cuenta"
      />
    </div>
  )
}