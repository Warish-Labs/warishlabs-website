# Local Development Guide — WarishLabs

This guide documents the prerequisites, local environment configurations, and database management tasks to run the WarishLabs platform locally.

---

## Prerequisites

Ensure you have the following runtimes installed locally:
- **Node.js**: `v20.9.0` or later (LTS recommended)
- **NPM**: `v9.0.0` or later
- **PostgreSQL**: `v15` or later

---

## Local Configuration

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   *Note: Using `--legacy-peer-deps` is required to resolve peer conflicts with React 19 / Next.js 16 in third-party library dependencies (such as `@react-three/fiber`).*

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root of the project:
   ```bash
   cp .env.example .env
   ```
   Set up your local PostgreSQL credentials in `DATABASE_URL`.

---

## Database Management (Prisma 7)

Prisma 7 decouples the schema declaration from database environment-specific parameters.

### 1. Generating Types
Prisma 7 reads schema parameters from `prisma.config.ts`. Run the generator:
```bash
npx prisma generate
```

### 2. Synchronize Schema
To sync the PostgreSQL database with the Prisma schema declarations:
```bash
npx prisma db push
```

### 3. Seeding Data
Run the database seed script to populate sample products, site layouts, navigation elements, and the administrative login credential:
```bash
npx tsx prisma/seed.ts
```

---

## Running Development Console

To launch the Next.js Turbopack compiler server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Admin console access**: Navigate to `/admin/dashboard` (Default Login: `admin@warishlabs.com` / Password: `Warish@786`).
- **Trigger event analytics mock**: Click around the products pages to dispatch local tracking requests to `/api/analytics/event`.
