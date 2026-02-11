import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Database client initialization
 * 
 * Connects to Neon PostgreSQL via DATABASE_URL environment variable.
 * Uses postgres-js driver which supports serverless functions.
 * 
 * Connection pooling is enabled by default for performance.
 * Set max connections if multiple concurrent requests are expected.
 */

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Create the PostgreSQL connection
// For serverless environments, use the pooling endpoint from Neon
const sql = postgres(databaseUrl, {
  max: 10, // Maximum number of connections in pool
  idle_timeout: 30, // Close idle connections after 30 seconds
});

// Initialize Drizzle ORM with the SQL client
export const db = drizzle(sql);

// Export the raw SQL client for direct queries if needed
export { sql };
