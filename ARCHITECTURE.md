# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Frontend)                        │
│                  (classroom-frontend)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Server                           │
│              (src/server.ts - :8000)                         │
│                                                              │
│  ├─ GET /api/subjects          (list all)                   │
│  ├─ GET /api/subjects/:id      (get one)                    │
│  ├─ POST /api/subjects         (create)                      │
│  ├─ PUT /api/subjects/:id      (update)                      │
│  └─ DELETE /api/subjects/:id   (delete)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ TCP + TLS
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  Drizzle ORM Layer                           │
│           (src/db/client.ts + src/db/schema.ts)             │
│                                                              │
│  ├─ Type-safe queries                                       │
│  ├─ Schema definitions                                      │
│  ├─ Query builders (select, insert, update, delete)         │
│  └─ Connection pooling                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ postgres-js driver
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Connection Pool                      │
│           (postgres-js driver - max 10)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Network Connection
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           🔒 Neon (Serverless PostgreSQL)                   │
│                                                              │
│  Databases:                                                 │
│  └─ neondb                                                  │
│     └─ public schema                                        │
│        ├─ subjects (created by db:push)                     │
│        └─ [other tables you add]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## File Dependency Graph

```
src/server.ts (Express App)
    │
    ├── import express
    ├── import dotenv
    ├── import { db } from './db/client.ts'
    │   └── uses DATABASE_URL from .env
    │
    └── import { subjectsTable } from './db/schema.ts'
        └── imports from 'drizzle-orm/pg-core'

src/db/client.ts (Database Connection)
    │
    ├── import drizzle from 'drizzle-orm/postgres-js'
    ├── import postgres from 'postgres'
    │
    └── reads: process.env.DATABASE_URL

src/db/schema.ts (Table Definitions)
    │
    ├── import pgTable, uuid, varchar, text, timestamp from 'drizzle-orm/pg-core'
    ├── export subjectsTable
    ├── export type Subject
    └── export type NewSubject

src/db/queries.ts (Query Examples)
    │
    ├── import { db } from './client.ts'
    └── import { subjectsTable } from './schema.ts'

src/db/migrate.ts (Migration Runner)
    │
    └── import { sql } from './client.ts'

Configuration:
├── .env               (Database URL + server config)
├── .env.example       (Template)
├── drizzle.config.ts  (Drizzle Kit configuration)
├── tsconfig.json      (TypeScript settings)
└── package.json       (Dependencies + scripts)
```

---

## Data Flow Example: Creating a Subject

```
1. Browser/Client
   └─ POST /api/subjects
      JSON: { 
        "departmentId": 1,
        "code": "MATH101", 
        "name": "Math", 
        "description": "..." 
      }
                           │
                           ↓
2. Express Route Handler (src/server.ts)
   ├─ Parse request body
   ├─ Validate required fields (departmentId, code, name)
   └─ Call Drizzle insert
                           │
                           ↓
3. Drizzle ORM Query Builder
   ├─ Build type-safe INSERT statement
   └─ Pass to postgres-js driver
                           │
                           ↓
4. postgres-js Driver
   ├─ Get connection from pool
   ├─ Execute SQL: INSERT INTO subjects (department_id, code, name, description, created_at, updated_at)
   │             VALUES ($1, $2, $3, $4, NOW(), NOW())
   │             RETURNING *
   └─ Return results to Drizzle
                           │
                           ↓
5. Neon PostgreSQL
   ├─ Execute INSERT
   ├─ Auto-increment serial id (integer)
   ├─ Set created_at & updated_at timestamps
   └─ Return new row with all fields
                           │
                           ↓
6. Back through Drizzle → postgres-js → Express Handler
   ├─ Receive full row from database
   ├─ Return 201 Created with JSON response
   └─ Connection goes back to pool
                           │
                           ↓
7. Browser/Client
   └─ Receive JSON with created subject including id, timestamps
```

---

## Type Safety Flow

```
Database Schema (src/db/schema.ts)
    │
    ├─ Define: subjectsTable with columns
    │   id: serial (integer, auto-increment)
    │   departmentId: integer (NOT NULL, foreign key to departments)
    │   code: varchar(50) (NOT NULL)
    │   name: varchar(255) (NOT NULL)
    │   description: text (nullable)
    │   createdAt: timestamp (auto-set)
    │   updatedAt: timestamp (auto-set)
    │
    └─ Infer Types:
       ├─ Subject = typeof subjectsTable.$inferSelect
       │   (All fields from SELECT, including id and timestamps)
       │   {
       │     id: number
       │     departmentId: number
       │     code: string
       │     name: string
       │     description: string | null
       │     createdAt: Date
       │     updatedAt: Date
       │   }
       │
       └─ NewSubject = typeof subjectsTable.$inferInsert
           (Fields for INSERT, omits auto-generated id)
           {
             departmentId: number     (required)
             code: string             (required)
             name: string             (required)
             description?: string     (optional)
             createdAt?: Date         (optional, server-set)
             updatedAt?: Date         (optional, server-set)
           }
                           │
                           ↓
Drizzle Query Builder (src/server.ts)
    │
    ├─ db.select().from(subjectsTable)
    │   Returns: Promise<Subject[]>
    │
    ├─ db.insert(subjectsTable).values(data: NewSubject)
    │   data must match NewSubject type
    │
    ├─ db.update(subjectsTable).set(data)
    │   Only allows fields that exist in Subject
    │
    └─ db.delete(subjectsTable).where(...)
        Returns: Promise<Subject[]>
                           │
                           ↓
TypeScript Compiler
    │
    ├─ Checks all queries match schema types
    ├─ IDE autocomplete shows all available fields
    ├─ Catch type errors at compile time (before database)
    └─ Generate type hints in editor
                           │
                           ↓
Type-Safe Execution
    └─ Only valid queries reach the database
```

---

## Environment Variables Flow

```
System Environment
    │
    └─ DATABASE_URL = "postgresql://..."
                   │
                   ↓
.env file (project root)
    │
    └─ loaded by: import 'dotenv/config'
                   │
                   ↓
process.env.DATABASE_URL
    │
    ├─ Used in: src/db/client.ts
    │   └─ Connects to Neon
    │
    └─ Used in: drizzle.config.ts
        └─ Drizzle Kit CLI knows where to push
```

---

## Request/Response Flow

### GET /api/subjects
```
Request:
┌──────────────────────┐
│ GET /api/subjects    │
│ Headers: (standard)  │
│ Body: (none)         │
└──────────────────────┘
           │
           ↓
Express Handler (line ~38):
┌──────────────────────────────────────┐
│ const subjects =                      │
│   await db.select()                   │
│        .from(subjectsTable)           │
└──────────────────────────────────────┘
           │
           ↓
Drizzle ORM:
┌──────────────────────────────────────┐
│ SELECT * FROM subjects               │
│ (with type checking)                 │
└──────────────────────────────────────┘
           │
           ↓
Neon Database:
┌──────────────────────────────────────┐
│ Returns all rows from subjects table │
└──────────────────────────────────────┘
           │
           ↓
Response:
┌────────────────────────────────────────┐
│ HTTP 200 OK                            │
│ Content-Type: application/json         │
│                                        │
│ [                                      │
│   {                                    │
│     "id": 1,                           │
│     "departmentId": 2,                 │
│     "code": "MATH101",                 │
│     "name": "Math",                    │
│     "description": "...",              │
│     "createdAt": "2024-01-01T...",     │
│     "updatedAt": "2024-01-01T..."      │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘
```

---

## Directory Structure With Descriptions

```
classroom-backend/
│
├── src/                           # Source code (TypeScript)
│   ├── db/                        # Database layer
│   │   ├── client.ts              # Drizzle + postgres-js initialization
│   │   ├── schema.ts              # Table definitions (data model)
│   │   ├── queries.ts             # Query pattern examples (REFERENCE)
│   │   └── migrate.ts             # Migration runner (for production)
│   │
│   └── server.ts                  # Express app with API routes
│
├── dist/                          # Compiled JavaScript (after npm run build)
│   └── [compiled .js files]
│
├── drizzle/                       # Migration files (auto-generated)
│   ├── 0000_initial.sql           # Creates subjects table
│   └── [future migrations]
│
├── node_modules/                  # Dependencies (npm install)
│
├── .env                           # Environment secrets (DON'T COMMIT)
├── .env.example                   # Environment template (DO COMMIT)
├── .gitignore                     # Git exclusion rules
│
├── package.json                   # Project metadata + dependencies
├── package-lock.json              # Dependency lock file
│
├── tsconfig.json                  # TypeScript compiler options
├── drizzle.config.ts              # Drizzle Kit CLI configuration
│
├── README.md                       # Project description
├── QUICK_START.md                 # Step-by-step setup guide
├── SETUP_GUIDE.md                 # Comprehensive documentation
├── INTEGRATION_SUMMARY.md          # What was added & why
└── ARCHITECTURE.md                # This file
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Framework** | Express.js 4.18 | HTTP server & routing |
| **Language** | TypeScript 5.3 | Type-safe JavaScript |
| **ORM** | Drizzle 0.30 | Type-safe database queries |
| **Database Driver** | postgres-js 3.4 | PostgreSQL client |
| **Database** | Neon | Serverless PostgreSQL |
| **Runtime** | Node.js 18+ | JavaScript execution |
| **Module System** | ES Modules | Modern JavaScript modules |
| **Config Management** | dotenv 16.3 | Environment variables |
| **Dev Tools** | tsx 4.7 | TypeScript executor |
| **Build System** | tsc (TypeScript) | Compile to JavaScript |

---

## Connection Lifecycle

```
Server Start
    │
    ├─ Load .env
    ├─ Read DATABASE_URL
    │
    └─ Initialize db/client.ts
       │
       ├─ Create postgres connection pool
       │   └─ max 10 connections
       │   └─ idle_timeout: 30 seconds
       │
       └─ Initialize Drizzle ORM
           └─ Ready for queries
                   │
                   ↓
    Handle HTTP Requests
       │
       ├─ Request arrives
       ├─ Get connection from pool
       ├─ Execute query
       ├─ Release connection back to pool
       │
       └─ Return response
                   │
                   ↓
    Server Shutdown
       │
       └─ Close all pooled connections to Neon
```

---

## Key Concepts

### Type Safety
- Tables defined in `schema.ts` generate TypeScript types
- Queries checked against types at compile time
- IDE shows available fields and types
- Runtime errors prevented before database access

### Connection Pooling
- 10 connections maintained in memory
- Reused for multiple requests
- Connections close after 30 seconds idle
- Better performance than new connection per request

### Serverless Ready
- Uses Neon's pooling endpoint
- Efficient for short-lived connections
- No connection state stored between requests
- Scales with demand

### Type Inference
- `Subject` type from `db.select()` = all columns + timestamps
- `NewSubject` type for `db.insert()` = fields only, IDs auto-generated
- TypeScript catches type mismatches before execution

---

**Visual Reference Complete** 📊
