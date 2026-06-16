import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  // En producción, Vercel enviará un header especial para asegurar que el request viene del Cron Job.
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    // Buscamos asientos 'pending' que lleven más de 10 minutos (es decir, el checkout fue abandonado)
    const expiredSeats = await prisma.seat.findMany({
      where: {
        status: 'pending',
        updatedAt: {
          lt: tenMinutesAgo
        }
      }
    })

    if (expiredSeats.length > 0) {
      await prisma.seat.updateMany({
        where: {
          id: { in: expiredSeats.map(s => s.id) }
        },
        data: {
          status: 'free',
          assigneeId: null,
          accessToken: null
        }
      })

      console.log(`Cleaned up ${expiredSeats.length} expired pending seats.`)
    }

    return NextResponse.json({ success: true, cleanedCount: expiredSeats.length })
  } catch (error) {
    console.error('Error cleaning up seats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
