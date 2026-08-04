/**
 * Generic one-off migration runner. Applies a single SQL file from
 * migrations/ against the Postgres pointed to by DATABASE_URL (.env.local).
 *
 *   node scripts/run-migration.js 005_offer_guests.sql
 *
 * Each migration uses IF NOT EXISTS, so re-running is safe.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { Pool } = require('pg');

(async () => {
  const file = process.argv[2];
  if (!file) {
    console.error('✗ Usage: node scripts/run-migration.js <file.sql>');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('✗ DATABASE_URL is not set (.env.local).');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'migrations', file);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // matches src/lib/database/db.ts
    // Apply migrations to this project's schema, not "public".
    options: `-c search_path=${process.env.DB_SCHEMA || 'gasolina'}`,
  });

  try {
    await pool.query(sql);
    console.log(`✓ Applied migration: ${file}`);
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
