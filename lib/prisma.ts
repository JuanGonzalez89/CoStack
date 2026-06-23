import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

declare global {
  var prisma: PrismaClient | undefined
}

function readDatabaseUrlFromEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return null
  }

  const contents = readFileSync(filePath, 'utf8')
  const match = contents.match(/^DATABASE_URL=(.*)$/m)

  if (!match?.[1]) {
    return null
  }

  return match[1].replace(/^['"]|['"]$/g, '')
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const envLocalPath = join(process.cwd(), '.env.local')
  const fromEnvLocal = readDatabaseUrlFromEnvFile(envLocalPath)
  if (fromEnvLocal) {
    return fromEnvLocal
  }

  const envPath = join(process.cwd(), '.env')
  const fromEnv = readDatabaseUrlFromEnvFile(envPath)
  if (fromEnv) {
    return fromEnv
  }

  return null
}

function createPrismaClient() {
  const databaseUrl = resolveDatabaseUrl()

  if (!databaseUrl) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    })
  }

  const pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  })
}

export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}