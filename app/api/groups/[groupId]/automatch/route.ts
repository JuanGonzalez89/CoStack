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
    const { automatchEnabled } = await request.json()

    if (typeof automatchEnabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

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
      data: { automatchEnabled }
    })

    return NextResponse.json({ success: true, automatchEnabled: updatedGroup.automatchEnabled })
  } catch (error) {
    console.error('Error updating automatch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
