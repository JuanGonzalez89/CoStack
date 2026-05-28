import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'prisma/config'

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

  throw new Error('DATABASE_URL is required for Prisma.')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
})