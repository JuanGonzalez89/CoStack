"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthJourneyForm } from '@/components/auth/auth-journey-form'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // En desarrollo, redirigir automáticamente al dashboard
    if (process.env.NODE_ENV !== 'production') {
      router.replace('/overview')
    }
  }, [router])

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