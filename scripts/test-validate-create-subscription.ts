import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/.env.local' })
import { prisma } from '../lib/prisma'
import { validateProviderToken } from '../lib/provider-validators'

async function main() {
  const user = await prisma.user.create({ data: { name: 'Sub Validator', email: `test+val+${Date.now()}@example.com`, passwordHash: 'x' } })
  const tool = await prisma.tool.create({ data: { slug: `val-test-${Date.now()}`, name: 'Val Tool', provider: 'test', monthlyCost: 1 } })
  const group = await prisma.group.create({ data: { name: `val-group-${Date.now()}`, inviteCode: `invite-${Date.now()}` } })
  const account = await prisma.account.create({ data: { userId: user.id, type: 'oauth', provider: 'test', providerAccountId: `prov-${Date.now()}`, access_token: 'fake-token' } })

  console.log('Account id:', account.id)

  const result = await validateProviderToken('test', account.access_token as string)
  console.log('Validation result:', result)

  if (result.valid) {
    const enc = null
    const sub = await prisma.toolSubscription.create({ data: { groupId: group.id, toolId: tool.id, oauthTokenId: account.id, sharedPasswordEncrypted: enc } })
    console.log('Created subscription:', sub.id)
  }

  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(2) })
