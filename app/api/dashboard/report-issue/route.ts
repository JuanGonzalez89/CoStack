import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { seatId, reason } = await request.json()
    if (!seatId || !reason) {
      return NextResponse.json({ error: "Datos incompletos para el reporte." }, { status: 400 })
    }

    // Verify the seat belongs to the user and is assigned
    const seat = await prisma.seat.findFirst({
      where: { id: seatId, assigneeId: userId, status: 'assigned' }
    })

    if (!seat) {
      return NextResponse.json({ error: "No se encontró un asiento activo para reportar." }, { status: 404 })
    }

    if (seat.isReported) {
      return NextResponse.json({ error: "Este acceso ya ha sido reportado y está en revisión." }, { status: 400 })
    }

    // Update the seat as reported
    await prisma.seat.update({
      where: { id: seatId },
      data: {
        isReported: true,
        reportedReason: reason
      }
    })

    // Log the bot event to pause organizer payout
    await prisma.botEvent.create({
      data: {
        groupId: seat.groupId,
        type: 'escrow_frozen',
        message: `Los fondos del grupo han sido congelados. Razón: ${reason} (Reportado por usuario ${userId})`
      }
    })

    return NextResponse.json({ success: true, message: "Reporte recibido. Hemos congelado los fondos y un administrador revisará el caso." }, { status: 200 })
  } catch (error) {
    console.error("Report Issue error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
