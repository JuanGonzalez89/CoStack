import { CheckoutView } from "@/components/dashboard/checkout-view"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isToolLive } from "@/lib/catalog"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{
    toolSlug: string
  }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { toolSlug } = await params;

  // Guard: solo se puede comprar una herramienta con provisioning escalable.
  // Bloquea deep-links a tools "Próximamente" (ChatGPT, Figma, etc.).
  if (!isToolLive(toolSlug)) {
    redirect("/suscripciones")
  }

  const session = await getServerSession(authOptions)
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null

  return <CheckoutView toolSlug={toolSlug} isOrganizer={user?.role === 'organizer'} />
}
