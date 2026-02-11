import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';


/**
 * Drizzle Kit configuration
 * 
 * This config tells Drizzle Kit where to find:
 * - Schema definitions
 * - Migration files
 * - Database connection details
 */
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// export default {
//   schema: './src/db/schema.ts',
//   out: './drizzle',
//   dialect: 'postgresql',
//   dbCredentials: {
//     url: process.env.DATABASE_URL || '',
//   },
// } satisfies Config;

export default defineConfig({
  schema: './src/db/schema/app.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
