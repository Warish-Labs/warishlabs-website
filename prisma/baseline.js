try {
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv is not installed
}

const { Client } = require('pg');
const crypto = require('crypto');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[Auto-Baseline] No DATABASE_URL found. Skipping baselining check.');
    return;
  }

  console.log('[Auto-Baseline] Connecting to the database...');
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('sslmode=') || connectionString.includes('neon.tech') 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    await client.connect();
    
    // Check if _prisma_migrations table exists
    const migrationsTableExistsRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = '_prisma_migrations'
      );
    `);
    const migrationsTableExists = migrationsTableExistsRes.rows[0].exists;

    // Check if Product table exists
    const productTableExistsRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'Product'
      );
    `);
    const productTableExists = productTableExistsRes.rows[0].exists;

    console.log(`[Auto-Baseline] Tables status - _prisma_migrations: ${migrationsTableExists}, Product: ${productTableExists}`);

    if (productTableExists && !migrationsTableExists) {
      console.log('[Auto-Baseline] Database is not empty, but _prisma_migrations table is missing. Baselining required.');
      
      // 1. Create the migrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
            "id" CHARACTER VARYING(36) PRIMARY KEY,
            "checksum" CHARACTER VARYING(64) NOT NULL,
            "finished_at" TIMESTAMP WITH TIME ZONE,
            "migration_name" CHARACTER VARYING(255) NOT NULL,
            "logs" TEXT,
            "rolled_back_at" TIMESTAMP WITH TIME ZONE,
            "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "applied_steps_count" INTEGER NOT NULL DEFAULT 0
        );
      `);
      console.log('[Auto-Baseline] Created _prisma_migrations table.');

      // 2. Insert the baseline migration row
      const migrationId = crypto.randomUUID();
      const migrationChecksum = '9ce3d40d9de7a8f112257cd50fbbd2ded724d5dd6699244f966f8ad83e926cbf';
      const migrationName = '20260628150227_init';

      await client.query(`
        INSERT INTO "_prisma_migrations" (
            "id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count"
        ) VALUES (
            $1, $2, now(), $3, now(), 1
        ) ON CONFLICT DO NOTHING;
      `, [migrationId, migrationChecksum, migrationName]);

      console.log(`[Auto-Baseline] Successfully baselined migration ${migrationName}.`);
    } else {
      console.log('[Auto-Baseline] No baselining needed.');
    }
  } catch (error) {
    console.error('[Auto-Baseline] Error checking or baselining database:', error);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[Auto-Baseline] Script failed:', err);
});
