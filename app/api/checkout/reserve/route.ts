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

    // Automatch engine: select a free seat from a group that has automatch enabled
    // We perform a short transaction that locks a candidate seat row using
    // FOR UPDATE SKIP LOCKED to avoid race conditions between concurrent buyers.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const reserved = await prisma.$transaction(async (tx) => {
      // Find a single free seat for the tool where the parent group allows automatch
      const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Seat"
        WHERE "toolId" = ${tool.id} AND status = 'free'
          AND "groupId" IN (SELECT id FROM "Group" WHERE "automatchEnabled" = true)
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `

      if (!rows || rows.length === 0) return null

      const seatId = rows[0].id

      // Update the seat within the same transaction to mark it as pending
      const updated = await tx.seat.update({
        where: { id: seatId },
        data: {
          status: 'pending',
          assigneeId: userId,
          expiresAt
        }
      })

      return updated
    })

    if (!reserved) {
      return NextResponse.json({ error: "No hay cupos disponibles para esta herramienta." }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Cupo reservado temporalmente", seatId: reserved.id }, { status: 200 })
  } catch (error) {
    console.error("Reserve error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
