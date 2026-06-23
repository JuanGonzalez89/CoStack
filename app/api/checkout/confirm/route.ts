import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userId = user.id

    const { lobbyId, paymentId } = await request.json()
    if (!lobbyId) {
      return NextResponse.json({ error: "Falta el ID de la sala." }, { status: 400 })
    }

    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } })
    if (!lobby) {
      return NextResponse.json({ error: "Sala no encontrada." }, { status: 404 })
    }

    // Verify payment with MP API if paymentId provided
    if (paymentId) {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      })

      if (!mpResponse.ok) {
        console.error(`[Checkout Confirm] Error verificando pago ${paymentId}`)
        return NextResponse.json({ error: "Error al verificar el pago." }, { status: 502 })
      }

      const paymentData = await mpResponse.json()
      if (paymentData.status !== 'approved') {
        return NextResponse.json({
          error: `El pago no está aprobado (estado: ${paymentData.status}).`,
        }, { status: 400 })
      }
    }

    const existingMember = await prisma.lobbyMember.findFirst({
      where: { lobbyId, userId },
    })
    if (existingMember) {
      return NextResponse.json({ success: true, message: "Ya estás en la sala." })
    }

    const currentMemberCount = await prisma.lobbyMember.count({ where: { lobbyId } })

    const isOrg = lobby.creatorId === userId
    let nextSeat = 1
    if (!isOrg) {
      const maxSeat = await prisma.lobbyMember.aggregate({
        where: { lobbyId },
        _max: { seatIndex: true },
      })
      nextSeat = Math.max(1, maxSeat._max.seatIndex || 1) + 1
    }

    await prisma.lobbyMember.create({
      data: {
        lobbyId,
        userId,
        seatIndex: nextSeat,
        amount: lobby.pricePerSeat,
        status: "paid",
      },
    })

    console.log(`[Checkout Confirm] Usuario ${userId} unido a sala ${lobbyId} (asiento ${nextSeat})`)

    return NextResponse.json({ success: true, lobbyId })
  } catch (error) {
    console.error("Confirm error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
