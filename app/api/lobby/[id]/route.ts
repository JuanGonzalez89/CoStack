import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMockState, clearMockState } from "@/lib/lobby-mock-store"
import { capturePayment, cancelAuthorization } from "@/lib/mercadopago.server"
import { runPurchaseBot } from "@/lib/headless.server"

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
      // Cancelar autorizaciones en MP antes de marcar como expirado
      const paidMembers = lobby.members.filter(m => m.status === "paid" && m.paymentRef)
      for (const member of paidMembers) {
        await cancelAuthorization(member.paymentRef!)
      }

      await prisma.lobby.update({
        where: { id },
        data: { status: "expired" },
      })
      await prisma.lobbyMember.updateMany({
        where: { lobbyId: id, status: "paid" },
        data: { status: "refunded" },
      })

      // Notificar a todos los miembros
      for (const member of lobby.members) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            lobbyId: lobby.id,
            message: `${lobby.toolName} — La sala expiró. Tu pago fue liberado.`,
          },
        })
      }

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
      paymentRef: m.paymentRef,
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
          paymentRef: null,
        })
        currentVirtualAdded++
      }
      nextSeatIndex++
    }

    allMembers.sort((a, b) => a.seatIndex - b.seatIndex)

    if (lobby.status === "waiting" && filledSeats >= lobby.totalSeats) {
      // 1. Mercado Pago - CAPTURA DE FONDOS (Escrow)
      console.log(`[Escrow] Sala llena. Iniciando CAPTURA de fondos en Mercado Pago para ${allMembers.length} usuarios.`)
      for (const member of allMembers) {
        if (!member.isMock && member.paymentRef) {
          await capturePayment(member.paymentRef, member.amount)
        }
      }
      console.log(`[Escrow] Fondos capturados correctamente ($${lobby.fullPrice}). Dinero en cuenta de CoStack.`)

      // 2. Ejecutar Automatización (Headless Browser)
      console.log(`[Bot] Despachando background job a Browserless...`)
      const generatedToken = await runPurchaseBot({
        toolProvider: lobby.provider,
        accessMethod: lobby.accessMethod,
        corporateEmail: "admin@costack.la",
        lobbyId: lobby.id,
      })

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
        accessToken: generatedToken,
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
