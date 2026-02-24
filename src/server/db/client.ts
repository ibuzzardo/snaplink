// @ts-nocheck
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a pool with reasonable defaults for edge cases
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections
  min: 2, // Min connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Export drizzle instance
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Export pool for shutdown
export { pool };
