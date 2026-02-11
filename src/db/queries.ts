/**
 * Example Drizzle ORM Queries
 * 
 * This file demonstrates common query patterns for the subjects table.
 * Copy these patterns for your own queries.
 * 
 * Note: This is a reference file. Use patterns in src/server.ts for actual implementation.
 */

import { db } from './client.js';
import { subjectsTable } from './schema.js';
import { eq, like, desc, asc, inArray, gt, and, count } from 'drizzle-orm';
import { sql } from './client.js';

// ============================================================================
// SELECT Queries (Read operations)
// ============================================================================

/** Get all subjects */
async function getAllSubjects() {
  const subjects = await db.select().from(subjectsTable);
  return subjects;
}

/** Get subject by ID */
async function getSubjectById(id: number) {
  const subject = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, id));
  
  return subject[0] || null;
}

/** Get subjects by partial name match (search) */
async function searchSubjects(searchTerm: string) {
  const results = await db
    .select()
    .from(subjectsTable)
    .where(like(subjectsTable.name, `%${searchTerm}%`));
  
  return results;
}

/** Get subjects sorted by creation date (newest first) */
async function getSubjectsSortedByDate() {
  const subjects = await db
    .select()
    .from(subjectsTable)
    .orderBy(desc(subjectsTable.createdAt));
  
  return subjects;
}

/** Get subjects sorted by name (A-Z) */
async function getSubjectsSortedByName() {
  const subjects = await db
    .select()
    .from(subjectsTable)
    .orderBy(asc(subjectsTable.name));
  
  return subjects;
}

/** Get only specific columns (optimized for small responses) */
async function getSubjectNamesOnly() {
  const subjects = await db
    .select({
      id: subjectsTable.id,
      name: subjectsTable.name,
    })
    .from(subjectsTable);
  
  return subjects;
}

/** Limit number of results (pagination first page) */
async function getFirstTenSubjects() {
  const subjects = await db
    .select()
    .from(subjectsTable)
    .limit(10)
    .offset(0);
  
  return subjects;
}

/** Pagination helper - get page of subjects */
async function getSubjectsPage(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const subjects = await db
    .select()
    .from(subjectsTable)
    .limit(pageSize)
    .offset(offset);
  
  return subjects;
}

/** Check if subject exists */
async function subjectExists(id: number): Promise<boolean> {
  const result = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(eq(subjectsTable.id, id));
  
  return result.length > 0;
}

// ============================================================================
// INSERT Queries (Create operations)
// ============================================================================

/** Create a single subject */
async function createSubject(
  name: string,
  code: string,
  departmentId: number,
  description?: string
) {
  const result = await db
    .insert(subjectsTable)
    .values({
      name,
      code,
      departmentId,
      description: description || null,
    })
    .returning();
  
  return result[0];
}

/** Create multiple subjects at once (batch insert) */
async function createMultipleSubjects(
  subjects: Array<{ name: string; code: string; departmentId: number; description?: string }>
) {
  const results = await db
    .insert(subjectsTable)
    .values(subjects)
    .returning();
  
  return results;
}

// ============================================================================
// UPDATE Queries (Modify operations)
// ============================================================================

/** Update subject name */
async function updateSubjectName(id: number, newName: string) {
  const result = await db
    .update(subjectsTable)
    .set({
      name: newName,
      updatedAt: new Date(),
    })
    .where(eq(subjectsTable.id, id))
    .returning();
  
  return result[0] || null;
}

/** Update subject description */
async function updateSubjectDescription(id: number, newDescription: string) {
  const result = await db
    .update(subjectsTable)
    .set({
      description: newDescription,
      updatedAt: new Date(),
    })
    .where(eq(subjectsTable.id, id))
    .returning();
  
  return result[0] || null;
}

/** Update multiple fields in a subject */
async function updateSubject(
  id: number,
  data: { name?: string; description?: string }
) {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  const result = await db
    .update(subjectsTable)
    .set(updateData)
    .where(eq(subjectsTable.id, id))
    .returning();
  
  return result[0] || null;
}

// ============================================================================
// DELETE Queries (Remove operations)
// ============================================================================

/** Delete a subject by ID */
async function deleteSubject(id: number) {
  const result = await db
    .delete(subjectsTable)
    .where(eq(subjectsTable.id, id))
    .returning();
  
  return result[0] || null;
}

/** Delete multiple subjects (if IDs are provided) */
async function deleteSubjectsByIds(ids: number[]) {
  if (ids.length === 0) {
    return [];
  }

  const result = await db
    .delete(subjectsTable)
    .where(inArray(subjectsTable.id, ids))
    .returning();
  
  return result;
}

// ============================================================================
// AGGREGATE Queries (Statistics)
// ============================================================================

/** Count total subjects */
async function countSubjects(): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(subjectsTable);

  return Number(result[0]?.value ?? 0);
}

/** Get subject count by checking with raw SQL directly */
async function countSubjectsRaw(): Promise<number> {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM subjects`;
    if (!result || !result[0]) {
      throw new Error('Failed to execute COUNT query');
    }
    return parseInt(result[0].count as string, 10);
  } catch (error) {
    throw new Error(`Count query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// COMPLEX Queries (Multiple conditions)
// ============================================================================

/** Example: Advanced filter (when more conditions are needed) */
async function findSubjectsAdvanced(filters: {
  nameContains?: string;
  createdAfter?: Date;
  sortBy?: 'name' | 'date';
}) {
  const conditions = [];

  if (filters.nameContains) {
    conditions.push(
      like(subjectsTable.name, `%${filters.nameContains}%`)
    );
  }

  if (filters.createdAfter) {
    conditions.push(
      gt(subjectsTable.createdAt, filters.createdAfter)
    );
  }

  let query = db.select().from(subjectsTable).$dynamic();


  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters.sortBy === 'name') {
    query = query.orderBy(asc(subjectsTable.name));
  } else if (filters.sortBy === 'date') {
    query = query.orderBy(desc(subjectsTable.createdAt));
  }

  return await query;
}

// ============================================================================
// Export all functions for use in other modules
// ============================================================================

export {
  getAllSubjects,
  getSubjectById,
  searchSubjects,
  getSubjectsSortedByDate,
  getSubjectsSortedByName,
  getSubjectNamesOnly,
  getFirstTenSubjects,
  getSubjectsPage,
  subjectExists,
  createSubject,
  createMultipleSubjects,
  updateSubjectName,
  updateSubjectDescription,
  updateSubject,
  deleteSubject,
  deleteSubjectsByIds,
  countSubjects,
  countSubjectsRaw,
  findSubjectsAdvanced,
};
