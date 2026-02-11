import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";

import { db } from "./db/client.js";
import { subjectsTable, type NewSubject } from "./db/schema.js";
import { eq } from "drizzle-orm";

/** 
 * Express server with Neon + Drizzle ORM integration
 * 
 * This server demonstrates:
 * - Database connection handling
 * - CRUD operations using type-safe Drizzle queries
 * - Error handling for database operations
 */

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Express server with Neon + Drizzle ORM' });
});

// ============================================================================
// Subjects Routes - Example CRUD operations
// ============================================================================

/**
 * GET /api/subjects
 * Returns all subjects from the database
 */
app.get('/api/subjects', async (_req: Request, res: Response) => {
  try {
    const subjects = await db.select().from(subjectsTable);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

/**
 * GET /api/subjects/:id
 * Returns a single subject by ID
 */
app.get('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Subject ID is required' });
      return;
    }
    
    const subject = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, id));

    if (!subject.length) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    res.json(subject[0]);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

/**
 * POST /api/subjects
 * Creates a new subject
 * Body: { name: string, description?: string }
 */
app.post('/api/subjects', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Validate required field
    if (!name) {
      res.status(400).json({ error: 'Subject name is required' });
      return;
    }

    // Insert new subject - type-safe with Drizzle
    const newSubject: NewSubject = {
      name,
      description: description || null,
    };

    const result = await db
      .insert(subjectsTable)
      .values(newSubject)
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

/**
 * PUT /api/subjects/:id
 * Updates a subject
 * Body: { name?: string, description?: string }
 */
app.put('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Subject ID is required' });
      return;
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const result = await db
      .update(subjectsTable)
      .set(updateData)
      .where(eq(subjectsTable.id, id))
      .returning();

    if (!result.length) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

/**
 * DELETE /api/subjects/:id
 * Deletes a subject
 */
app.delete('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Subject ID is required' });
      return;
    }

    const result = await db
      .delete(subjectsTable)
      .where(eq(subjectsTable.id, id))
      .returning();

    if (!result.length) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    res.json({ message: 'Subject deleted successfully', deleted: result[0] });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// ============================================================================
// Error handling for unmatched routes
// ============================================================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================================
// Server startup
// ============================================================================

app.listen(port, () => {
  console.log(`✓ Server running at http://localhost:${port}`);
  console.log(`✓ Database: Connected via Neon + Drizzle ORM`);
});

