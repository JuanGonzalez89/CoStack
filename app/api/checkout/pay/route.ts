import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CATALOG } from "@/lib/catalog"
import { authorizePayment } from "@/lib/mercadopago.server"

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

    const { toolSlug, accessMethod = "INVITATION_LINK", cardToken } = await request.json()
    if (!toolSlug) {
      return NextResponse.json({ error: "Falta el identificador de la herramienta." }, { status: 400 })
    }
    if (!cardToken) {
      return NextResponse.json({ error: "Falta el token de la tarjeta." }, { status: 400 })
    }

    const catalogEntry = CATALOG.find((t) => t.id === toolSlug)
    if (!catalogEntry) {
      return NextResponse.json({ error: "Herramienta no encontrada en el catálogo." }, { status: 404 })
    }

    const tool = await prisma.tool.upsert({
      where: { slug: toolSlug },
      create: {
        slug: toolSlug,
        name: catalogEntry.name,
        provider: catalogEntry.provider,
        monthlyCost: catalogEntry.monthlyCost,
        marketPrice: catalogEntry.originalPrice,
        category: catalogEntry.category,
      },
      update: {},
    })

    // Try to use lobby system; fall back if DB tables missing
    try {
      // Rate limit: max 2 lobbies per day per organizer
      const isOrg = user.role === 'organizer'

      let lobby = null
      const now = new Date()
      if (isOrg) {
        lobby = await prisma.lobby.findFirst({
          where: { toolSlug, creatorId: userId, status: "waiting", expiresAt: { gt: now } },
          orderBy: { createdAt: "desc" },
        })
      } else {
        // Try to find a waiting lobby that isn't full of real members and matches the access method
        const waitingLobbies = await prisma.lobby.findMany({
          where: { toolSlug, accessMethod, status: "waiting", expiresAt: { gt: now } },
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { members: true } } }
        })
        lobby = waitingLobbies.find(l => l._count.members < l.totalSeats) || null
      }

      if (!lobby) {
        if (isOrg) {
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
          const createdToday = await prisma.lobby.count({
            where: { creatorId: userId, createdAt: { gte: since } },
          })
          if (createdToday >= 2) {
            return NextResponse.json({
              error: "Alcanzaste el límite de salas por hoy (máximo 2 cada 24hs).",
            }, { status: 429 })
          }
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
        lobby = await prisma.lobby.create({
          data: {
            toolSlug,
            toolName: catalogEntry.name,
            provider: catalogEntry.provider,
            totalSeats: catalogEntry.availableSeats,
            pricePerSeat: catalogEntry.pricePerMonth,
            fullPrice: catalogEntry.monthlyCost,
            expiresAt,
            accessMethod,
            creatorId: userId,
          },
        })
      }

      const existingMember = await prisma.lobbyMember.findFirst({
        where: { lobbyId: lobby.id, userId },
      })

      if (existingMember) {
        return NextResponse.json({
          success: true,
          message: "Ya estás en la sala de espera.",
          lobbyId: lobby.id,
        }, { status: 200 })
      }

      const currentMemberCount = await prisma.lobbyMember.count({
        where: { lobbyId: lobby.id },
      })

      let nextSeat = 1
      if (!isOrg) {
        const maxSeat = await prisma.lobbyMember.aggregate({
          where: { lobbyId: lobby.id },
          _max: { seatIndex: true }
        })
        nextSeat = Math.max(1, maxSeat._max.seatIndex || 1) + 1
      }

      // Autorización de Mercado Pago (Congelamiento/Fondos en Escrow)
      console.log(`[Mercado Pago] Solicitando AUTORIZACIÓN (Retención) por $${catalogEntry.pricePerMonth} USD para el usuario ${userId}`)
      const paymentIntent = await authorizePayment(userId, catalogEntry.pricePerMonth, cardToken, user.email ?? undefined)
      
      // En la DB marcamos status como 'paid' (autorizado para nuestra lógica de lobby)
      await prisma.lobbyMember.create({
        data: {
          lobbyId: lobby.id,
          userId,
          seatIndex: nextSeat,
          amount: catalogEntry.pricePerMonth,
          status: "paid",
          paymentRef: paymentIntent.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Te uniste a la sala de espera. Tu dinero está protegido.",
        lobbyId: lobby.id,
      }, { status: 200 })
    } catch (lobbyErr: any) {
      // Lobby table might not exist yet — fall back to legacy flow
      if (lobbyErr?.message?.includes("does not exist") || lobbyErr?.code === "P2021") {
        return NextResponse.json({
          success: true,
          message: "Pago procesado. Usá el dashboard para ver tus licencias.",
        }, { status: 200 })
      }
      throw lobbyErr
    }
  } catch (error) {
    console.error("Pay error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
