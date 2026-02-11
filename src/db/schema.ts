import { pgTable, text, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * Database schema definitions using Drizzle ORM
 * 
 * Each table is defined with proper types and constraints.
 * All tables are type-safe and provide excellent IDE autocomplete.
 */

export const subjectsTable = pgTable('subjects', {
  // Primary key as UUID
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Subject name - required, limited to 255 characters
  name: varchar('name', { length: 255 }).notNull(),
  
  // Subject description - optional, can be null
  description: text('description'),
  
  // Timestamps for tracking creation and updates
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type inference: Extract table types for use in application
export type Subject = typeof subjectsTable.$inferSelect;
export type NewSubject = typeof subjectsTable.$inferInsert;
