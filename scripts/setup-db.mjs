// Crea las tablas y carga datos de ejemplo (solo si están vacías).
// Uso: npm run db:setup (lee .env.local) o DATABASE_URL=postgres://... npm run db:setup
import { readFileSync } from 'node:fs';
import postgres from 'postgres';

for (const f of ['.env.local', '.env']) {
  try { process.loadEnvFile(f); } catch {}
}

// En Neon, el esquema se carga por la conexión directa (sin -pooler).
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error('Falta la variable DATABASE_URL');
  process.exit(1);
}

const sql = postgres(url, { ssl: process.env.DATABASE_SSL === 'false' ? false : 'prefer' });
for (const file of ['db/schema.sql', 'db/seed.sql']) {
  await sql.unsafe(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
  console.log(`OK ${file}`);
}
await sql.end();
