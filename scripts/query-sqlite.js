const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'dev.db');
console.log('DB path:', dbPath);
const db = new Database(dbPath, { readonly: true });
try {
  const rows = db.prepare('SELECT id, name, email, createdAt FROM User ORDER BY createdAt DESC LIMIT 20').all();
  console.log(JSON.stringify(rows, null, 2));
} catch (err) {
  console.error('Query error', err.message);
} finally {
  db.close();
}
