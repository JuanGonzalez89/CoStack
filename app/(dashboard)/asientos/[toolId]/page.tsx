import { notFound } from 'next/navigation'
import { GestionAsientosView } from '@/components/dashboard/gestion-asientos-view'
import { getDashboardSnapshot } from '@/lib/dashboard-snapshot.server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const knownTools = new Set(['chatgpt', 'figma', 'notion', 'midjourney', 'copilot', 'vercel', 'canva'])

export default async function ToolSeatPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params
  if (!knownTools.has(toolId)) {
    notFound()
  }

  const session = await getServerSession(authOptions)
  const snapshot = await getDashboardSnapshot(session?.user?.email)

  return <GestionAsientosView snapshot={snapshot} />
}