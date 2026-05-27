import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'prisma/config'

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const envLocalPath = join(process.cwd(), '.env.local')

  if (existsSync(envLocalPath)) {
    const contents = readFileSync(envLocalPath, 'utf8')
    const match = contents.match(/^DATABASE_URL=(.*)$/m)

    if (match?.[1]) {
      return match[1].replace(/^['"]|['"]$/g, '')
    }
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