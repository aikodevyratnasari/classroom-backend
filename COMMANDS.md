# Command Reference Guide

Quick reference for all available commands and their usage.

---

## 🚀 Essential Commands

### Installation
```bash
# Install all dependencies (run once, in classroom-backend/)
npm install
```

### Development
```bash
# Start development server with hot-reload
# Server runs at http://localhost:8000
npm run dev
```

### Database
```bash
# Push current schema to Neon database
# Use during development for quick iterations
npm run db:push

# Run migrations on database
# Use in production with generated migration files
npm run db:migrate
```

### Building
```bash
# Compile TypeScript to JavaScript
# Output goes to dist/ folder
npm run build

# Run the compiled version (production mode)
npm start
```

---

## 🔧 All Scripts (from package.json)

| Script | Command | Purpose |
|--------|---------|---------|
| `npm start` | `node dist/server.js` | Run compiled production server |
| `npm run dev` | `tsx watch src/server.ts` | Development with hot-reload |
| `npm run build` | `tsc` | Compile TypeScript |
| `npm run db:push` | `drizzle-kit push:pg` | Push schema to database |
| `npm run db:migrate` | `node --loader tsx src/db/migrate.ts` | Run migrations |

---

## 📦 Package Management

### Add a New Package
```bash
npm install package-name
```

### Add a Dev Dependency
```bash
npm install --save-dev package-name
```

### Update All Packages
```bash
npm update
```

### Check Installed Versions
```bash
npm ls
npm ls drizzle-orm    # Check specific package
```

---

## 🗄️ Database Commands

### Drizzle Kit Generate Migrations
```bash
# Generate migration files for schema changes
# Requires drizzle.config.ts to be set up
npx drizzle-kit generate:pg
```

### Drizzle Kit Introspect
```bash
# Pull existing database schema from Neon
# Useful if schema already exists in database
npx drizzle-kit introspect:pg
```

### Drizzle Studio (Interactive UI)
```bash
# Open browser UI to manage database
npx drizzle-kit studio
```

---

## 🌐 API Testing Commands

### Test Server Health
```bash
# Basic GET request
curl http://localhost:8000/

# Should return:
# {"message":"Express server with Neon + Drizzle ORM"}
```

### Get All Subjects
```bash
curl http://localhost:8000/api/subjects

# Should return: []
```

### Create a Subject
```bash
curl -X POST http://localhost:8000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name": "Mathematics", "description": "Basic math"}'

# Should return: 201 Created with the subject object
```

### Get Subject by ID
```bash
# Replace {id} with actual ID from create response
curl http://localhost:8000/api/subjects/{id}

# Should return: { "id": "...", "name": "Mathematics", ... }
```

### Update Subject
```bash
curl -X PUT http://localhost:8000/api/subjects/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Advanced Mathematics"}'

# Should return: Updated subject object
```

### Delete Subject
```bash
curl -X DELETE http://localhost:8000/api/subjects/{id}

# Should return: 200 OK with deleted subject
```

### List Subjects (with jq for pretty output)
```bash
curl http://localhost:8000/api/subjects | jq .

# jq makes JSON output pretty (pipe through jq)
```

---

## 🐛 Debugging & Troubleshooting

### Check Node.js Version
```bash
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
```

### Test Database Connection
```bash
# This will test if DATABASE_URL is set correctly
# Place in a temporary script or use psql if available
npm run db:push   # Will fail if connection is bad
```

### Check TypeScript for Errors
```bash
npx tsc --noEmit   # Check without emitting files
npx tsc             # Compile and show errors
```

### View Server Logs
```bash
# When running npm run dev, logs appear in terminal
# Errors include file names and line numbers
npm run dev
```

### List All Available npm Scripts
```bash
npm run
```

---

## 🔀 Development Workflow

### Step-by-Step Development
```bash
# 1. Make sure dependencies are installed
npm install

# 2. Create .env with DATABASE_URL
cat > .env << EOF
DATABASE_URL=postgresql://user:password@host/db
NODE_ENV=development
PORT=8000
EOF

# 3. Push schema to database (first time only)
npm run db:push

# 4. Start development server
npm run dev

# 5. In another terminal, test API
curl http://localhost:8000/api/subjects

# 6. Make code changes (hot-reload happens automatically)
# 7. Test API again
```

---

## 📤 Deployment Preparation

### Build for Production
```bash
# 1. Compile TypeScript
npm run build

# 2. Check dist/ folder was created
ls -la dist/

# 3. Test production build locally
npm start

# 4. Check for errors
npm run build 2>&1 | grep error
```

### Pre-Deployment Checklist
```bash
# Verify dependencies
npm ls

# Check TypeScript compilation
npx tsc --noEmit

# Verify .env is in .gitignore
grep -q ".env" .gitignore && echo "✓ .env is ignored"

# Check dist/ is in .gitignore
grep -q "dist" .gitignore && echo "✓ dist/ is ignored"

# Verify no uncommitted changes (after git setup)
git status
```

---

## 🔐 Environment Variables

### Using Environment Variables in Code
```typescript
// In your code
const port = process.env.PORT || 8000;
const env = process.env.NODE_ENV || 'development';
const dbUrl = process.env.DATABASE_URL;

// Check if variable exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
```

### Set Environment Variables

**Temporary (terminal session only):**
```bash
# Linux/Mac
export DATABASE_URL="postgresql://..."
export NODE_ENV=development

# Windows PowerShell
$env:DATABASE_URL = "postgresql://..."
$env:NODE_ENV = "development"
```

**Permanent (via .env file):**
```bash
DATABASE_URL=postgresql://...
NODE_ENV=development
PORT=8000
```

---

## 📊 Useful Utilities

### Format and Pretty-Print JSON
```bash
# View formatted JSON from API
curl http://localhost:8000/api/subjects | jq .

# Count items in array
curl http://localhost:8000/api/subjects | jq length

# Get first item
curl http://localhost:8000/api/subjects | jq '.[0]'

# Get specific field from all items
curl http://localhost:8000/api/subjects | jq '.[].name'
```

### Time a Request
```bash
# See how long request takes
time curl http://localhost:8000/api/subjects

# Or use curl's timing info
curl -w "@curl-format.txt" http://localhost:8000/api/subjects
```

### Monitor Server
```bash
# Watch server logs in real-time
npm run dev     # Shows logs as they happen

# Or save logs to file
npm run dev 2>&1 | tee server.log
```

---

## 🆘 Common Issues & Fixes

### Port Already in Use
```bash
# Find and kill process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID {PID} /F

# Mac/Linux
lsof -i :8000
kill -9 {PID}
```

### DATABASE_URL Not Found
```bash
# Ensure .env file exists
cat .env

# Or set it in current session
export DATABASE_URL="postgresql://..."

# Then run server
npm run dev
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete lock files and node modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript Compilation Errors
```bash
# Check all TypeScript errors
npx tsc --noEmit --pretty

# Or just try building
npm run build

# See specific errors for a file
npx tsc src/server.ts --noEmit
```

---

## 📝 Creating Migration Files

### Generate Migration from Schema Changes
```bash
# 1. Make changes to src/db/schema.ts
# 2. Generate migration files
npm run db:push

# Migration files appear in drizzle/ folder with SQL
```

### View Generated Migration
```bash
# List migration files
ls -la drizzle/

# View migration SQL
cat drizzle/0000_initial.sql

# View metadata
cat drizzle/meta/_journal.json
```

---

## 🎯 Common Development Scenarios

### Scenario: Adding a New Table

```bash
# 1. Edit src/db/schema.ts - add table definition
nano src/db/schema.ts

# 2. Push to database
npm run db:push

# 3. Add routes to src/server.ts
nano src/server.ts

# 4. Test API
curl http://localhost:8000/api/new-table
```

### Scenario: Modifying Existing Table

```bash
# 1. Update schema in src/db/schema.ts
vim src/db/schema.ts

# 2. Push changes
npm run db:push

# 3. Verify changes in database
# Check Neon console or run SELECT from table

# 4. Update routes/queries if needed
```

### Scenario: Deploying to Production

```bash
# 1. Build locally
npm run build

# 2. Verify no errors
npm start

# 3. Commit changes
git add .
git commit -m "Add new features"

# 4. Push to git
git push

# 5. Deploy (instructions depend on hosting platform)
# Vercel, Railway, AWS, etc. each have their own process

# 6. Set DATABASE_URL in production environment
# Through platform's UI or CLI
```

---

## 🔗 Useful Command Combinations

### Setup From Scratch
```bash
npm install && npm run db:push && npm run dev
```

### Build and Test
```bash
npm run build && npm start
```

### Clean and Reinstall
```bash
rm -rf node_modules package-lock.json && npm install
```

### Check Everything
```bash
npm run build && npx tsc --noEmit && npm ls
```

---

**Last Updated:** February 2026  
**Command Reference Version:** 1.0
