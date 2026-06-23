import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RoleSelector } from '@/components/onboarding/role-selector'

export default async function WelcomePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      role: true,
      memberships: { take: 1 },
    },
  })

  if (!user) redirect('/login')

  const hasMemberships = user.memberships.length > 0

  if (!hasMemberships) {
    return <RoleSelector isChangingRole={user.role === 'organizer' || user.memberships.length > 0} />
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-white">No podés cambiar de rol ahora</h2>
        <p className="text-zinc-400 leading-relaxed">
          Tenés suscripciones o salas de espera activas. Terminá tus compras pendientes antes de cambiar de rol.
        </p>
        <a
          href="/overview"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-colors"
        >
          Volver al dashboard
        </a>
      </div>
    </div>
  )
}
