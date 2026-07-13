export const maxDuration = 300

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
        creator: { select: { id: true, email: true } },
        members: {
          orderBy: { seatIndex: "asc" },
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 })
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! }, select: { id: true } })
    const isCreator = currentUser?.id === lobby.creatorId
    const isMember = lobby.members.some((m) => m.userId === currentUser?.id)

    // Solo el creador o un miembro de la sala pueden ver su estado (incluye el
    // accessToken/link de invitación). Sin esto, cualquier usuario logueado que
    // consiga un lobbyId ajeno podría leer el link de invitación de otra sala.
    if (!isCreator && !isMember) {
      return NextResponse.json({ error: "No pertenecés a esta sala." }, { status: 403 })
    }

    const now = new Date()

    if (lobby.status === "waiting" && lobby.expiresAt < now) {
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

      for (const member of lobby.members) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            lobbyId: lobby.id,
            message: `${lobby.toolName} — La sala expiró. Tu pago fue liberado.`,
          },
        })
      }

      return NextResponse.json({
        id: lobby.id,
        status: "expired",
        filledSeats: lobby.members.length,
        totalSeats: lobby.totalSeats,
        expiresAt: lobby.expiresAt.toISOString(),
        creatorId: lobby.creatorId,
        isCreator,
        members: [],
        message: "El tiempo de la sala de espera expiró. Tu pago será devuelto.",
      })
    }

    const filledSeats = lobby.members.length
    const members = lobby.members.map((m) => ({
      seatIndex: m.seatIndex,
      amount: m.amount,
      email: m.user.email,
      name: m.user.name,
      paymentRef: m.paymentRef,
      isSelf: m.user.email === session.user?.email,
    }))

    if ((lobby.status === "waiting" || lobby.status === "processing") && filledSeats >= lobby.totalSeats) {
      // Atomic lock — solo un request puede pasar
      const locked = await prisma.lobby.updateMany({
        where: { id, status: "waiting" },
        data: { status: "processing" },
      })

      if (locked.count === 0) {
        // Ya está siendo procesado por otro request — devolver estado actual
        return NextResponse.json({
          id: lobby.id,
          status: lobby.status as "processing" | "completed" | "expired" | "waiting",
          filledSeats,
          totalSeats: lobby.totalSeats,
          expiresAt: lobby.expiresAt.toISOString(),
          accessToken: lobby.accessToken,
          creatorId: lobby.creatorId,
          isCreator,
          toolName: lobby.toolName,
          provider: lobby.provider,
          pricePerSeat: lobby.pricePerSeat,
          members,
        })
      }

      console.log(`[Escrow] Sala llena. Iniciando CAPTURA de fondos en Mercado Pago para ${filledSeats} usuarios.`)
      for (const member of lobby.members) {
        if (member.paymentRef) {
          await capturePayment(member.paymentRef, member.amount)
        }
      }
      console.log(`[Escrow] Fondos capturados correctamente ($${lobby.fullPrice}). Dinero en cuenta de CoStack.`)

      console.log(`[Bot] Provisionando acceso via ${lobby.accessMethod}...`)
      const membersToInvite = lobby.members.map(m => ({
        email: m.user.email,
        userId: m.userId,
      }))

      let generatedToken = ""
      try {
        generatedToken = await runPurchaseBot({
          lobbyId: lobby.id,
          toolSlug: lobby.toolSlug,
          toolName: lobby.toolName,
          members: membersToInvite,
        })
      } catch (err) {
        console.error(`[Bot] Error en provisioner, rollback a waiting:`, err)
        await prisma.lobby.update({
          where: { id },
          data: { status: "waiting" },
        })
        throw err
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

      return NextResponse.json({
        id: lobby.id,
        status: "completed",
        filledSeats,
        totalSeats: lobby.totalSeats,
        expiresAt: lobby.expiresAt.toISOString(),
        accessToken: generatedToken,
        creatorId: lobby.creatorId,
        isCreator,
        toolName: lobby.toolName,
        provider: lobby.provider,
        pricePerSeat: lobby.pricePerSeat,
        members,
        message: "¡Se completaron los cupos! Ya podés acceder a tu licencia.",
      })
    }

    return NextResponse.json({
      id: lobby.id,
      status: lobby.status,
      filledSeats,
      totalSeats: lobby.totalSeats,
      expiresAt: lobby.expiresAt.toISOString(),
      creatorId: lobby.creatorId,
      isCreator,
      members,
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
