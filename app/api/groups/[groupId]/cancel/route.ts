import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: true }
    })

    const membership = user?.memberships.find(m => m.groupId === groupId && m.role === 'organizer')
    
    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized: Not an organizer of this group' }, { status: 403 })
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { cancellationScheduledFor: new Date() } // Al final del mes en un entorno real
    })

    // Se notificaría a los miembros aquí
    await prisma.botEvent.create({
      data: {
        groupId,
        type: 'group_cancelled',
        message: 'El organizador ha programado la cancelación de este espacio. El acceso se mantendrá hasta finalizar el ciclo actual.'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
