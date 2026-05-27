const fs = require('fs');
const path = require('path');
// load .env if exists
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  });
}

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    console.log(JSON.stringify(users.slice(-20), null, 2));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
