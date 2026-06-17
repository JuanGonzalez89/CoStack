import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cancelAuthorization } from "@/lib/mercadopago.server"

export async function GET() {
  try {
    const now = new Date()

    const expiredLobbies = await prisma.lobby.findMany({
      where: {
        status: "waiting",
        expiresAt: { lt: now },
      },
      include: {
        members: {
          where: { status: "paid" },
        },
      },
    })

    console.log(`[Cron] Expirando ${expiredLobbies.length} salas vencidas.`)

    for (const lobby of expiredLobbies) {
      // Cancelar autorizaciones en MP
      for (const member of lobby.members) {
        if (member.paymentRef) {
          await cancelAuthorization(member.paymentRef)
        }
      }

      // Marcar lobby como expirado
      await prisma.lobby.update({
        where: { id: lobby.id },
        data: { status: "expired" },
      })

      // Marcar miembros como reembolsados
      await prisma.lobbyMember.updateMany({
        where: { lobbyId: lobby.id, status: "paid" },
        data: { status: "refunded" },
      })

      // Crear notificaciones
      const allMembers = await prisma.lobbyMember.findMany({
        where: { lobbyId: lobby.id },
      })
      for (const member of allMembers) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            lobbyId: lobby.id,
            message: `${lobby.toolName} — La sala expiró. Tu pago fue liberado.`,
          },
        })
      }

      console.log(`[Cron] Sala ${lobby.id} expirada y fondos liberados.`)
    }

    return NextResponse.json({
      ok: true,
      expiredCount: expiredLobbies.length,
    })
  } catch (error) {
    console.error("[Cron] Error expirando salas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
