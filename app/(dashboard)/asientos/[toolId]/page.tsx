import { notFound } from 'next/navigation'
import { GestionAsientosView } from '@/components/dashboard/gestion-asientos-view'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'

const knownTools = new Set(['chatgpt', 'figma', 'notion', 'midjourney', 'copilot', 'vercel', 'canva'])

export default async function ToolSeatPage({ params }: { params: { toolId: string } }) {
  if (!knownTools.has(params.toolId)) {
    notFound()
  }
  const session = await getServerSession(authOptions)
  const snapshot = await getDashboardSnapshot(session?.user?.email)

  return <GestionAsientosView snapshot={snapshot} />
}