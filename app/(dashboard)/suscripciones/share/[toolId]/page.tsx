import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ShareToolView } from "@/components/dashboard/share-tool-view"

interface PageProps {
  params: Promise<{
    toolId: string
  }>
}

export default async function ShareToolPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const { toolId } = await params

  const tool = await prisma.tool.findUnique({
    where: { slug: toolId }
  })

  if (!tool) {
    redirect('/suscripciones')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true }
  })

  return <ShareToolView tool={tool} userId={user!.id} />
}
