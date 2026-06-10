import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env.local' })
// use global fetch
import { prisma } from '../lib/prisma'

async function main() {
  // Create test user and group/tool if not exist
  const user = await prisma.user.create({ data: { name: 'Sub Tester', email: `test+sub+${Date.now()}@example.com`, passwordHash: 'x' } })
  const tool = await prisma.tool.create({ data: { slug: `sub-test-${Date.now()}`, name: 'Sub Tool', provider: 'test', monthlyCost: 1 } })
  const group = await prisma.group.create({ data: { name: `sub-group-${Date.now()}`, inviteCode: `invite-${Date.now()}` } })

  // Create a fake account to reference as oauthTokenId
  const account = await prisma.account.create({ data: { userId: user.id, type: 'oauth', provider: 'test', providerAccountId: `prov-${Date.now()}`, access_token: 'fake-token' } })

  console.log('Created test account id:', account.id)

  // Call subscribe endpoint
  const res = await fetch('http://localhost:3000/api/tools/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId: group.id, toolId: tool.id, oauthToken: account.id })
  })

  console.log('Status:', res.status)
  console.log('Body:', await res.text())

  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(2) })
