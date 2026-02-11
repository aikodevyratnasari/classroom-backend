/**
 * Drizzle Kit configuration
 *
 * This config tells Drizzle Kit where to find:
 * - Schema definitions
 * - Migration files
 * - Database connection details
 */
declare const _default: {
    schema: string;
    out: string;
    dialect: "postgresql";
    dbCredentials: {
        url: string;
    };
};
export default _default;
