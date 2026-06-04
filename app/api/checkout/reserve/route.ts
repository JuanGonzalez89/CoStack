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

    const { toolSlug } = await request.json()
    if (!toolSlug) {
      return NextResponse.json({ error: "toolSlug is required" }, { status: 400 })
    }

    const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } })
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // Release expired seats (lazy cleanup)
    await prisma.seat.updateMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() }
      },
      data: {
        status: 'free',
        assigneeId: null,
        expiresAt: null
      }
    })

    // Auto-match: find a free seat for this tool
    // We use a transaction-like approach to prevent race conditions
    const availableSeats = await prisma.seat.findMany({
      where: { 
        toolId: tool.id, 
        status: 'free' 
      },
      take: 5
    })

    if (availableSeats.length === 0) {
      return NextResponse.json({ error: "No hay cupos disponibles para esta herramienta." }, { status: 400 })
    }

    // Try to reserve one of the available seats optimistically
    let reservedSeat = null
    for (const seat of availableSeats) {
      const updated = await prisma.seat.updateMany({
        where: { id: seat.id, status: 'free' },
        data: {
          status: 'pending',
          assigneeId: userId,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        }
      })
      if (updated.count > 0) {
        reservedSeat = seat
        break
      }
    }

    if (!reservedSeat) {
      // Someone else took the seats we tried, race condition happened
      return NextResponse.json({ error: "Los cupos se acaban de ocupar. Intenta de nuevo." }, { status: 409 })
    }

    return NextResponse.json({ success: true, message: "Cupo reservado temporalmente" }, { status: 200 })
  } catch (error) {
    console.error("Reserve error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
