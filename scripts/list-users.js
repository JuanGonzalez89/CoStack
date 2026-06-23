const fs = require('fs');
if (!process.env.DATABASE_URL) {
	try {
		const env = fs.readFileSync('.env', 'utf8');
		for (const line of env.split(/\r?\n/)) {
			const m = line.match(/^\s*DATABASE_URL=(?:"|')?(.*?)(?:"|')?\s*$/);
			if (m) {
				process.env.DATABASE_URL = m[1];
				break;
			}
		}
	} catch (e) {
		// ignore
	}
}

const {PrismaClient} = require("@prisma/client");
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

(async () => {
	let prisma;
	if (process.env.DATABASE_URL) {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const adapter = new PrismaPg(pool);
		prisma = new PrismaClient({ adapter });
	} else {
		prisma = new PrismaClient();
	}
	try {
		const users = await prisma.user.findMany();
		console.log(JSON.stringify(users, null, 2));
	} catch (e) {
		console.error(e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
})();
