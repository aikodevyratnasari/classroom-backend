/**
 * Database schema definitions using Drizzle ORM
 * 
 * This module re-exports the canonical schema definitions from schema/index.ts
 * which are kept in sync with the database migrations.
 * All tables are type-safe and provide excellent IDE autocomplete.
 * 
 * Canonical definitions:
 * - subjectsTable: subjects with serial id, department_id, and code (NOT NULL)
 * - departments: departments table with serial id and unique code
 * - Subject and NewSubject types: inferred from subjectsTable for type safety
 */

export * from './schema/index.js';
