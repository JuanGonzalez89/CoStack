import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env.local' })
import { prisma } from '../lib/prisma'

async function main() {
  const assigned = await prisma.seat.findMany({ where: { status: 'assigned' }, take: 10 })
  console.log('Assigned seats:', assigned.map(s => ({ id: s.id, toolId: s.toolId, assigneeId: s.assigneeId })))

  const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  console.log('Recent payments:', payments.map(p => ({ id: p.id, providerRef: p.providerRef, amount: p.amount, status: p.status })))

  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(2) })
