import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AyudaView } from '@/components/dashboard/ayuda-view'

export default async function AyudaPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  return <AyudaView />
}
