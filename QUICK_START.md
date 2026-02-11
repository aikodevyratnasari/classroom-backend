<!-- 
  Quick Start Checklist for Neon + Drizzle ORM Integration
  Follow these steps in order to get your backend running
-->

# 🚀 Quick Start Checklist

## Phase 1: Pre-Setup (Before Any Code)

### Neon Account & Project
- [ ] Create Neon account at https://neon.tech
- [ ] Create a new Neon project
- [ ] Copy the PostgreSQL connection string (Pooling Endpoint)
- [ ] Test the connection string format: `postgresql://user:password@host-pooler.neon.tech/dbname?sslmode=require`

## Phase 2: Project Configuration

### Environment Setup
- [ ] Open `.env.example` in `classroom-backend/`
- [ ] Create a new file `.env` in `classroom-backend/`
- [ ] Copy contents from `.env.example` to `.env`
- [ ] Replace `DATABASE_URL` with your actual Neon connection string
- [ ] Verify `.env` is listed in `.gitignore` (it should be)

### Dependency Installation
- [ ] Open terminal in `classroom-backend/` directory
- [ ] Run: `npm install`
- [ ] Wait for completion (may take 1-2 minutes)
- [ ] Verify `node_modules/` folder is created

### Check Installation
- [ ] Run: `npm ls drizzle-orm`
- [ ] Run: `npm ls postgres`
- [ ] Both should show installed versions

## Phase 3: Database Setup

### Initialize Database Schema
- [ ] Run: `npm run db:push`
- [ ] Watch console output for "Pushed successfully" message
- [ ] Verify in Neon console that `subjects` table was created
  - Log into Neon
  - Go to your project
  - Open SQL editor
  - Run: `SELECT * FROM subjects;`
  - Should return empty table (no error means success)

## Phase 4: Server Startup

### Start Development Server
- [ ] Run: `npm run dev`
- [ ] Look for message: `✓ Server running at http://localhost:8000`
- [ ] Look for message: `✓ Database: Connected via Neon + Drizzle ORM`
- [ ] If you see errors, check `.env` file has correct `DATABASE_URL`

### Test Server Health
- [ ] Open browser: http://localhost:8000/
- [ ] Should see JSON response: `{ "message": "Express server with Neon + Drizzle ORM" }`
- [ ] Open browser: http://localhost:8000/api/subjects
- [ ] Should see JSON response: `[]` (empty array)

## Phase 5: Test CRUD Operations

### Create (POST)
- [ ] Open Postman or Terminal
- [ ] Create subject: `POST http://localhost:8000/api/subjects`
- [ ] Body (JSON): `{"name": "Mathematics", "description": "Basic math"}`
- [ ] Should receive `201 Created` with the created subject including `id`

### Read All (GET)
- [ ] Open: `GET http://localhost:8000/api/subjects`
- [ ] Should return array with the subject you just created

### Read One (GET)
- [ ] Copy the `id` from the created subject
- [ ] Open: `GET http://localhost:8000/api/subjects/{id}`
- [ ] Should return just that subject

### Update (PUT)
- [ ] Use same `id`
- [ ] Open: `PUT http://localhost:8000/api/subjects/{id}`
- [ ] Body (JSON): `{"name": "Advanced Mathematics"}`
- [ ] Should return updated subject with new name

### Delete (DELETE)
- [ ] Use same `id`
- [ ] Open: `DELETE http://localhost:8000/api/subjects/{id}`
- [ ] Should return `200 OK` with deleted subject
- [ ] Verify with GET: `GET http://localhost:8000/api/subjects` returns empty array

## Phase 6: Development Work

### Add New Tables
- [ ] Open `src/db/schema.ts`
- [ ] Add new table definition after `subjectsTable`
- [ ] Define TypeScript types with `$inferSelect` and `$inferInsert`
- [ ] Run: `npm run db:push`
- [ ] Verify new table in Neon

### Add New Routes
- [ ] Open `src/server.ts`
- [ ] Copy CRUD pattern from subjects routes
- [ ] Adapt to your new table
- [ ] Data types are automatically type-safe from Drizzle

### Query Patterns Reference
- [ ] Open `src/db/queries.ts`
- [ ] Find the query pattern you need
- [ ] Copy and adapt to your tables
- [ ] All import statements are ready to use

## Phase 7: Production Preparation

### Before Deploying
- [ ] Verify all `.env` variables are set
- [ ] Run: `npm run build`
- [ ] Verify `dist/` folder was created
- [ ] Check TypeScript has no errors in terminal
- [ ] Test: `npm start` (runs compiled version)

### Environment Setup
- [ ] Set `NODE_ENV=production` in your deployment platform
- [ ] Set `DATABASE_URL` to your Neon production connection strings
- [ ] Set `PORT` if your platform requires it

### Database Migrations
- [ ] Use `npm run db:push` in development
- [ ] For production, capture migration files first:
  - Migrations are in `drizzle/` folder
  - Each schema change generates SQL files
  - Review before applying to production
- [ ] Use `npm run db:migrate` in production deployments

## ✅ Verification Checklist

After completing all steps, verify:

Features Working:
- [ ] Server starts without errors
- [ ] Can connect to Neon database
- [ ] All CRUD endpoints respond correctly
- [ ] Database changes persist (restart server, data still there)
- [ ] No TypeScript compilation errors
- [ ] Environment variables are properly loaded

Good to Have:
- [ ] `.env` file is in `.gitignore`
- [ ] `node_modules/` is in `.gitignore`
- [ ] `dist/` is in `.gitignore`
- [ ] Can build project without errors
- [ ] Production build runs successfully

## 🆘 Troubleshooting

### Problem: `DATABASE_URL environment variable is not defined`
**Solution:**
1. Check `.env` file exists in `classroom-backend/`
2. Verify it has `DATABASE_URL=...` line
3. Restart terminal (environment variables are cached)
4. Check spelling: `DATABASE_URL` (all caps)

### Problem: Connection timeout
**Solution:**
1. Verify your Neon connection string is correct
2. Ensure you're using the **Pooling Endpoint** (has `-pooler` in hostname)
3. Check internet connection
4. Verify IP address is not blocked by Neon

### Problem: Table not found error
**Solution:**
1. Run: `npm run db:push` again
2. Check Neon console to see if table was created
3. Run in Neon SQL editor: `\dt` (list all tables)

### Problem: Port 8000 already in use
**Solution:**
1. Change `PORT` in `.env` file (e.g., `PORT=3000`)
2. Or kill process using port 8000:
   - Windows: `netstat -ano | findstr :8000` then `taskkill /PID {id} /F`
   - Mac/Linux: `lsof -i :8000` then `kill -9 {PID}`

### Problem: TypeScript compilation errors
**Solution:**
1. Run: `npm run build`
2. Read error messages carefully
3. Usually means missing `$inferSelect` or `$inferInsert` in schema
4. Check example in `src/db/schema.ts`

## 📚 Reference Links Inside Project

After setting up, consult these documentation files:
- **SETUP_GUIDE.md** - Comprehensive setup and usage guide
- **INTEGRATION_SUMMARY.md** - Overview of all changes made
- **src/db/queries.ts** - 20+ query pattern examples
- **src/server.ts** - Working CRUD endpoint examples

## 🎓 Next Learning Steps

1. **Understand Drizzle ORM:**
   - Read `src/db/schema.ts` comments
   - Study `src/db/queries.ts` patterns

2. **Extend the API:**
   - Add more tables to `src/db/schema.ts`
   - Add routes to `src/server.ts`

3. **Learn Neon Features:**
   - Visit https://neon.tech/docs
   - Explore branching and development environments

4. **Deploy to Production:**
   - Choose hosting (Vercel, Railway, EC2, etc.)
   - Set database connection strings
   - Deploy and monitor

---

**Estimated Setup Time:** 5-10 minutes  
**Success Indicator:** All CRUD tests pass ✅
