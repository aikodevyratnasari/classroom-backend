/**
 * Drizzle Kit configuration
 *
 * This config tells Drizzle Kit where to find:
 * - Schema definitions
 * - Migration files
 * - Database connection details
 */
export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || '',
    },
};
