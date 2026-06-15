import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMockState, clearMockState } from "@/lib/lobby-mock-store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lobby = await prisma.lobby.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: { seatIndex: "asc" },
          include: { user: { select: { id: true, email: true } } },
        },
      },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 })
    }

    const now = new Date()

    if (lobby.status === "waiting" && lobby.expiresAt < now) {
      await prisma.lobby.update({
        where: { id },
        data: { status: "expired" },
      })
      await prisma.lobbyMember.updateMany({
        where: { lobbyId: id, status: "paid" },
        data: { status: "refunded" },
      })
      clearMockState(id)
      return NextResponse.json({
        id: lobby.id,
        status: "expired",
        filledSeats: lobby.members.length,
        totalSeats: lobby.totalSeats,
        expiresAt: lobby.expiresAt.toISOString(),
        members: [],
        message: "El tiempo de la sala de espera expiró. Tu pago será devuelto.",
      })
    }

    const realCount = lobby.members.length
    const { virtualSeats } = getMockState(lobby.id, realCount, lobby.totalSeats)
    const filledSeats = realCount + virtualSeats

    const realMembers = lobby.members.map((m) => ({
      seatIndex: m.seatIndex,
      amount: m.amount,
      isMock: false,
      isSelf: m.user.email === session.user?.email,
    }))

    const allMembers = [...realMembers]
    let currentVirtualAdded = 0
    let nextSeatIndex = 1

    while (currentVirtualAdded < virtualSeats && allMembers.length < lobby.totalSeats) {
      if (!allMembers.find(m => m.seatIndex === nextSeatIndex)) {
        allMembers.push({
          seatIndex: nextSeatIndex,
          amount: lobby.pricePerSeat,
          isMock: true,
          isSelf: false,
        })
        currentVirtualAdded++
      }
      nextSeatIndex++
    }

    allMembers.sort((a, b) => a.seatIndex - b.seatIndex)

    if (lobby.status === "waiting" && filledSeats >= lobby.totalSeats) {
      // 1. Etapa MVP: Mercado Pago - CAPTURA DE FONDOS
      console.log(`[Escrow] Sala llena. Iniciando CAPTURA de fondos en Mercado Pago para ${allMembers.length} usuarios.`)
      // En entorno real, llamamos a capturePayment por cada miembro:
      // import { capturePayment } from "@/lib/mercadopago.server"
      // for (const member of allMembers) {
      //   await capturePayment(`pay_intent_${member.seatIndex}`, member.amount)
      // }
      console.log(`[Escrow] Fondos capturados correctamente ($${lobby.fullPrice}). Dinero en cuenta de CoStack.`)

      // 2. Ejecutar Automatización (Headless Browser) usando la Tarjeta Virtual de MP
      // En entorno real, importamos runPurchaseBot de lib/headless.server.ts
      console.log(`[Bot] Despachando background job a Browserless...`)
      
      let generatedToken = ""
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
      await delay(1500) // Simular latencia del bot en la nube
      
      if (lobby.accessMethod === "INVITATION_LINK") {
        generatedToken = `https://${lobby.provider.toLowerCase()}.com/invite/${Math.random().toString(36).substring(2, 10)}`
        console.log(`[Bot] Link de invitación obtenido: ${generatedToken}`)
      } else {
        generatedToken = `sk_live_lobby_${Math.random().toString(36).substring(2, 15)}`
        console.log(`[Bot] API Key obtenida: ${generatedToken}`)
      }

      await prisma.lobby.update({
        where: { id },
        data: {
          status: "completed",
          completedAt: now,
          accessToken: generatedToken,
        },
      })

      const userIds = lobby.members.map((m) => m.userId)
      for (const uid of userIds) {
        await prisma.notification.create({
          data: {
            userId: uid,
            lobbyId: lobby.id,
            message: `${lobby.toolName} — ¡Tu licencia ya está disponible!`,
          },
        })
      }

      clearMockState(id)

      return NextResponse.json({
        id: lobby.id,
        status: "completed",
        filledSeats,
        totalSeats: lobby.totalSeats,
        expiresAt: lobby.expiresAt.toISOString(),
        accessToken: mockToken,
        members: allMembers,
        message: "¡Se completaron los cupos! Ya podés acceder a tu licencia.",
      })
    }

    return NextResponse.json({
      id: lobby.id,
      status: lobby.status,
      filledSeats,
      totalSeats: lobby.totalSeats,
      expiresAt: lobby.expiresAt.toISOString(),
      members: allMembers,
      toolName: lobby.toolName,
      provider: lobby.provider,
      pricePerSeat: lobby.pricePerSeat,
      accessToken: lobby.accessToken,
    })
  } catch (error) {
    console.error("Lobby GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
