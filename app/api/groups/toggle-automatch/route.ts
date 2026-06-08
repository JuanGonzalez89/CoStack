import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { groupId, automatchEnabled } = await request.json()

    if (!groupId) return NextResponse.json({ error: 'Missing groupId' }, { status: 400 })

    const membership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } }
    })

    if (!membership || membership.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can toggle automatch' }, { status: 403 })
    }

    if (automatchEnabled) {
      const seats = await prisma.seat.findMany({
        where: { groupId },
        include: { tool: true }
      })
      
      const nonBusinessTools = Array.from(new Set(seats.filter(s => !s.tool.isBusiness).map(s => s.toolId)))
      
      if (nonBusinessTools.length > 0) {
        const subscriptions = await prisma.toolSubscription.findMany({
          where: { 
            groupId, 
            toolId: { in: nonBusinessTools }
          }
        })

        const hasMissingCredentials = nonBusinessTools.some(toolId => {
          const sub = subscriptions.find(s => s.toolId === toolId)
          return !sub || (!sub.oauthTokenId && !sub.sharedPasswordEncrypted)
        })

        if (hasMissingCredentials) {
          return NextResponse.json({ 
            error: 'Faltan_Credenciales',
            message: 'Debes configurar las credenciales de todas las herramientas compartidas antes de activar Automatch.' 
          }, { status: 400 })
        }
      }
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { automatchEnabled: Boolean(automatchEnabled) }
    })

    return NextResponse.json({ success: true, group: updatedGroup })
  } catch (err) {
    console.error('Toggle automatch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
