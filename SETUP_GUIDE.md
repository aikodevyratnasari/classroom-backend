# Neon + Drizzle ORM Integration Guide

This backend project is fully integrated with **Neon** (serverless PostgreSQL) and **Drizzle ORM** for type-safe database operations.

## Quick Start

### 1. Setup Neon Project

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the database connection string (PostgreSQL URL)

### 2. Configure Environment Variables

Create a `.env` file in the `classroom-backend` directory:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
NODE_ENV=development
PORT=8000
```

**Note:** Use the pooling endpoint from Neon for serverless compatibility. It will look like:
```
postgresql://neondb_owner:hash@host-pooler.neon.tech/neondb?sslmode=require
```

### 3. Install Dependencies

```bash
cd classroom-backend
npm install
```

### 4. Generate and Push Schema

The first time, push your schema to the database:

```bash
npm run db:push
```

This creates the tables defined in `src/db/schema.ts` without creating migration files.

### 5. Run the Server

**Development mode** (with hot-reload):
```bash
npm run dev
```

**Production build and run**:
```bash
npm run build
npm start
```

---

## Project Structure

```
classroom-backend/
├── src/
│   ├── db/
│   │   ├── client.ts      # Database connection initialization
│   │   ├── schema.ts      # Table definitions and type inference
│   │   └── migrate.ts     # Migration runner helper
│   └── server.ts          # Express app with example CRUD routes
├── drizzle/               # Auto-generated migration files
├── dist/                  # Compiled JavaScript output
├── drizzle.config.ts      # Drizzle Kit configuration
├── tsconfig.json          # TypeScript compiler options
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables (not in git)
```

---

## Key Files Explained

### `src/db/client.ts`
Initializes the database connection with Drizzle ORM:
- Connects to Neon via `DATABASE_URL`
- Configures connection pooling (max 10 connections)
- Exports `db` for type-safe queries
- Exports `sql` for raw SQL if needed

```typescript
import { db } from './db/client.ts';

const results = await db.select().from(subjectsTable);
```

### `src/db/schema.ts`
Defines database tables with full type safety:
- Each table is a Postgres column definition
- Automatic type inference for queries
- Support for constraints, defaults, and relationships

```typescript
export const subjectsTable = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Automatic type inference
export type Subject = typeof subjectsTable.$inferSelect;
export type NewSubject = typeof subjectsTable.$inferInsert;
```

### `drizzle.config.ts`
Configuration for Drizzle Kit CLI:
- Points to schema definitions
- Specifies PostgreSQL dialect
- Uses `DATABASE_URL` for connection

---

## Example: CRUD Operations

All examples are in `src/server.ts`. Here's how they work:

### **CREATE** - Insert a new subject

```typescript
app.post('/api/subjects', async (req, res) => {
  const { name, description } = req.body;
  
  const newSubject = await db
    .insert(subjectsTable)
    .values({ name, description })
    .returning();
  
  res.status(201).json(newSubject[0]);
});
```

**HTTP Request:**
```bash
curl -X POST http://localhost:8000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name": "Mathematics", "description": "Basic math"}'
```

### **READ** - Get all subjects

```typescript
app.get('/api/subjects', async (req, res) => {
  const subjects = await db.select().from(subjectsTable);
  res.json(subjects);
});
```

**HTTP Request:**
```bash
curl http://localhost:8000/api/subjects
```

### **READ** - Get one subject by ID

```typescript
app.get('/api/subjects/:id', async (req, res) => {
  const subject = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, req.params.id));
  
  res.json(subject[0]);
});
```

### **UPDATE** - Modify a subject

```typescript
app.put('/api/subjects/:id', async (req, res) => {
  const updated = await db
    .update(subjectsTable)
    .set({ name: req.body.name, updatedAt: new Date() })
    .where(eq(subjectsTable.id, req.params.id))
    .returning();
  
  res.json(updated[0]);
});
```

### **DELETE** - Remove a subject

```typescript
app.delete('/api/subjects/:id', async (req, res) => {
  const deleted = await db
    .delete(subjectsTable)
    .where(eq(subjectsTable.id, req.params.id))
    .returning();
  
  res.json({ message: 'Deleted', deleted: deleted[0] });
});
```

---

## Drizzle Kit Commands

### `npm run db:push`
Creates or updates schema directly in the database.
- Use in **development** for quick iterations
- Generates migration files automatically

```bash
npm run db:push
```

### `npm run db:migrate`
Runs pending migrations.
- Use in **production** for controlled deployments
- Requires migration files to exist

```bash
npm run db:migrate
```

---

## Adding New Tables

1. **Define the table** in `src/db/schema.ts`:

```typescript
export const studentsTable = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subjectId: uuid('subject_id').references(() => subjectsTable.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Student = typeof studentsTable.$inferSelect;
export type NewStudent = typeof studentsTable.$inferInsert;
```

2. **Push to database**:

```bash
npm run db:push
```

3. **Use in queries**:

```typescript
import { db } from './db/client.ts';
import { studentsTable } from './db/schema.ts';

const students = await db.select().from(studentsTable);
```

---

## Troubleshooting

### Connection Issues

**Error: `DATABASE_URL environment variable is not defined`**
- Make sure `.env` file exists in `classroom-backend/`
- Restart the development server after creating `.env`

**Error: `password authentication failed`**
- Verify your Neon connection string is correct
- Check that credentials haven't changed
- Use the **pooling endpoint** for best results

### TypeScript Compilation

**Error: `Cannot find module 'drizzle-orm'`**
- Ensure dependencies are installed: `npm install`
- Check `package.json` has the required packages

---

## Performance Tips

1. **Use Connection Pooling** (enabled by default)
   - Neon automatically pools connections
   - Use the pooling endpoint in production

2. **Indexes on Frequently Filtered Columns**
   ```typescript
   name: varchar('name').notNull().index(),
   ```

3. **Only Select Needed Fields**
   ```typescript
   // Instead of db.select().from(table)
   await db.select({ id: table.id, name: table.name }).from(table);
   ```

4. **Use Batch Queries**
   ```typescript
   const [subjects, students] = await Promise.all([
     db.select().from(subjectsTable),
     db.select().from(studentsTable),
   ]);
   ```

---

## Compatibility

- **Node.js**: 18+ (ES modules support)
- **PostgreSQL**: 12+ (Neon supports latest)
- **TypeScript**: 5.3+
- **Drizzle ORM**: 0.30+

---

## Useful Resources

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs)
- [PostgreSQL JDBC URL Format](https://neon.tech/docs/connect/connection-details)

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` with your Neon connection string
3. ✅ Run `npm run db:push` to create tables
4. ✅ Start server: `npm run dev`
5. ✅ Test CRUD endpoints with curl or Postman
