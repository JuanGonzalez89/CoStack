import { CheckoutView } from "@/components/dashboard/checkout-view"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface PageProps {
  params: Promise<{
    toolSlug: string
  }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { toolSlug } = await params;
  
  const session = await getServerSession(authOptions)
  const user = session?.user?.email 
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberships: true }
      })
    : null

  return <CheckoutView toolSlug={toolSlug} isOrganizer={user?.memberships.some(m => m.role === 'organizer') ?? false} />
}
