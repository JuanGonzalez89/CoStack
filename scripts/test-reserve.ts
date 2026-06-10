import { prisma } from '../lib/prisma'

async function createTestData() {
  // Cleanup previous test data
  await prisma.tool.deleteMany({ where: { slug: { startsWith: 'test-tool-' } } })
  await prisma.group.deleteMany({ where: { name: { startsWith: 'test-group-' } } })
  await prisma.user.deleteMany({ where: { email: { contains: 'test+reserve' } } })

  const user = await prisma.user.create({ data: { name: 'Test Reserve', email: `test+reserve+${Date.now()}@example.com`, passwordHash: 'test' } })
  const tool = await prisma.tool.create({ data: { slug: `test-tool-${Date.now()}`, name: 'Test Tool', provider: 'test', monthlyCost: 10 } })
  const group = await prisma.group.create({ data: { name: `test-group-${Date.now()}`, inviteCode: `invite-${Date.now()}`, automatchEnabled: true } })

  const seats = []
  for (let i = 0; i < 3; i++) {
    const s = await prisma.seat.create({ data: { groupId: group.id, toolId: tool.id } })
    seats.push(s)
  }

  return { user, tool, group, seats }
}

async function attemptReserve(userId: string, toolId: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  try {
    const reserved = await prisma.$transaction(async (tx) => {
      const rows: Array<{ id: string }> = await tx.$queryRaw`
        SELECT id FROM "Seat"
        WHERE "toolId" = ${toolId} AND status = 'free'
          AND "groupId" IN (SELECT id FROM "Group" WHERE "automatchEnabled" = true)
        LIMIT 1 FOR UPDATE SKIP LOCKED
      `
      if (!rows || rows.length === 0) return null
      const seatId = rows[0].id
      const updated = await tx.seat.update({ where: { id: seatId }, data: { status: 'pending', assigneeId: userId, expiresAt } })
      return updated
    })
    return reserved
  } catch (err) {
    console.error('Transaction error:', err)
    return null
  }
}

async function main() {
  try {
    const { user, tool, seats } = await createTestData()
    console.log('Created user:', user.id)
    console.log('Seats created:', seats.map(s => s.id))

    // Fire 6 concurrent reservation attempts against 3 seats
    const attempts = 6
    const promises: Array<Promise<any>> = []
    for (let i = 0; i < attempts; i++) {
      promises.push(attemptReserve(user.id, tool.id))
    }

    const results = await Promise.all(promises)
    const reserved = results.filter(r => r !== null)

    console.log(`Attempts: ${attempts}, Reserved: ${reserved.length}`)
    console.log('Reserved seat ids:', reserved.map(r => r.id))

    const seatsDb = await prisma.seat.findMany({ where: { toolId: tool.id } })
    console.log('Seats in DB:', seatsDb.map(s => ({ id: s.id, status: s.status, assigneeId: s.assigneeId })))

    process.exit(reserved.length > 0 ? 0 : 1)
  } catch (err) {
    console.error(err)
    process.exit(2)
  } finally {
    try { await prisma.$disconnect() } catch(e){}
  }
}

main()
