import { prisma } from '../lib/prisma'

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Users:', users.length)
  } catch (error) {
    console.error('Error connecting to DB:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
