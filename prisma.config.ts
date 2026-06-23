import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'prisma/config'

function readDatabaseUrlFromEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return null
  }

  const contents = readFileSync(filePath, 'utf8')
  const directMatch = contents.match(/^DIRECT_URL=(.*)$/m)
  if (directMatch?.[1]) {
    return directMatch[1].replace(/^['"]|['"]$/g, '')
  }

  const dbMatch = contents.match(/^DATABASE_URL=(.*)$/m)
  if (!dbMatch?.[1]) {
    return null
  }

  return dbMatch[1].replace(/^['"]|['"]$/g, '')
}

function resolveDatabaseUrl() {
  if (process.env.DIRECT_URL) {
    return process.env.DIRECT_URL
  }
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

  return 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
}

const databaseUrl = resolveDatabaseUrl()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
})