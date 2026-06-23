import { notFound } from 'next/navigation'
import { GestionAsientosView } from '@/components/dashboard/gestion-asientos-view'

const knownTools = new Set(['chatgpt', 'figma', 'notion', 'midjourney', 'copilot', 'vercel', 'canva'])

export default function ToolSeatPage({ params }: { params: { toolId: string } }) {
  if (!knownTools.has(params.toolId)) {
    notFound()
  }

  return <GestionAsientosView />
}