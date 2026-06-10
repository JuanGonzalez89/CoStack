const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    // Cleanup any previous test data
    await prisma.tool.deleteMany({ where: { slug: { startsWith: 'test-tool-' } } })
    await prisma.group.deleteMany({ where: { name: { startsWith: 'test-group-' } } })
    await prisma.user.deleteMany({ where: { email: { contains: 'test+reserve' } } })

    // Create a user
    const user = await prisma.user.create({
      data: {
        name: 'Test Reserve',
        email: `test+reserve+${Date.now()}@example.com`,
        passwordHash: 'test'
      }
    })

    // Create a tool and group
    const tool = await prisma.tool.create({ data: { slug: `test-tool-${Date.now()}`, name: 'Test Tool', provider: 'test', monthlyCost: 10 } })
    const group = await prisma.group.create({ data: { name: `test-group-${Date.now()}`, inviteCode: `invite-${Date.now()}`, automatchEnabled: true } })

    // Create 3 seats for the tool/group
    const seats = []
    for (let i = 0; i < 3; i++) {
      const s = await prisma.seat.create({ data: { groupId: group.id, toolId: tool.id } })
      seats.push(s)
    }

    console.log('Created user:', user.id)
    console.log('Tool:', tool.id, 'Group:', group.id)
    console.log('Seats created:', seats.map(s => s.id))

    // Run the transactional reservation similar to the API
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const reserved = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw`SELECT id FROM "Seat" WHERE "toolId" = ${tool.id} AND status = 'free' AND "groupId" IN (SELECT id FROM "Group" WHERE "automatchEnabled" = true) LIMIT 1 FOR UPDATE SKIP LOCKED`
      if (!rows || rows.length === 0) return null
      const seatId = rows[0].id
      const updated = await tx.seat.update({ where: { id: seatId }, data: { status: 'pending', assigneeId: user.id, expiresAt } })
      return updated
    })

    if (!reserved) {
      console.error('No seat reserved')
      process.exit(1)
    }

    console.log('Reserved seat:', reserved.id, 'status:', reserved.status, 'assignee:', reserved.assigneeId)

    // Fetch seat from DB to confirm
    const seatDb = await prisma.seat.findUnique({ where: { id: reserved.id } })
    console.log('Seat in DB:', { id: seatDb.id, status: seatDb.status, assigneeId: seatDb.assigneeId, expiresAt: seatDb.expiresAt })

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(2)
  } finally {
    try { await prisma.$disconnect() } catch(e){}
  }
})()
