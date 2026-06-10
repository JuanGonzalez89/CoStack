import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { OrganizerLobbyClient } from "./organizer-lobby-client"

export default async function OrganizerLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect(ROUTES.login)

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (user?.role !== "organizer") redirect(ROUTES.overview)

  const { id } = await params

  const lobby = await prisma.lobby.findUnique({
    where: { id },
  })

  if (!lobby || lobby.creatorId !== user.id) {
    redirect(ROUTES.overview)
  }

  return <OrganizerLobbyClient lobbyId={id} />
}
