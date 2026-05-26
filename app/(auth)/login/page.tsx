import { AuthJourneyForm } from '@/components/auth/auth-journey-form'

export default function LoginPage() {
  return (
    <div className="w-full">
      <AuthJourneyForm
        mode="login"
        title="Iniciar sesión"
        description="Accedé con tu email y contraseña."
        submitLabel="Entrar"
      />
    </div>
  )
}