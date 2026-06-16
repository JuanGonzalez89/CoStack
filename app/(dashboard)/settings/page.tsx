import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true }
  })
  const isOrganizer = user?.memberships.some(m => m.role === 'organizer')
  if (!isOrganizer) {
    redirect('/overview')
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Settings</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Configuración general</h1>
        <p className="text-sm text-muted-foreground">Pantalla base para administración de cuenta y espacio.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Esta sección queda lista para el Sprint 2, cuando se agregue la gestión real de miembros, roles y herramientas.
      </div>
    </section>
  )
}