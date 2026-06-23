/**
 * One-off migration runner: creates the `form_registrations` table on the
 * (Neon/VPS) Postgres pointed to by DATABASE_URL.
 *
 *   node scripts/create-registrations-table.js
 *
 * Idempotent — uses CREATE TABLE/INDEX IF NOT EXISTS, safe to re-run.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { Pool } = require('pg');

(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('✗ DATABASE_URL is not set (.env.local).');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'migrations', '001_form_registrations.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // matches src/lib/database/db.ts
  });

  try {
    await pool.query(sql);
    console.log('✓ form_registrations table is ready.');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
