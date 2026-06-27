# WarishLabs Platform

Live URL: [warishlabs.in](https://warishlabs.in) | Deployment URL: [warishlabs.vercel.app](https://warishlabs.vercel.app)

A premium software engineering laboratory website constructed on Next.js 16 (Turbopack) and Tailwind CSS v4, featuring a high-performance database-seeded CMS, custom event analytics tracking, Clerk SSO integration, and hardware-accelerated 3D WebGL visuals.

---

## Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router with Partial Prerendering and Turbopack compiler)
- **UI & Layout**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configurations), Lucide React, Shadcn v4 base components
- **3D Renderings**: React Three Fiber, `@react-three/drei`, Three.js
- **Database ORM**: [Prisma 7](https://www.prisma.io/) (PostgreSQL client via PG connection pool and adapter driver)
- **User Authentication**: [Clerk SSO](https://clerk.com/)
- **Email Delivery**: Resend SDK
- **Media Uploads**: Cloudinary SDK
- **Rate Limiting**: Token bucket rate limit caches (Upstash Redis optionally)

---

## Architectural Features

### 1. Unified Authentication Layer
The system uses custom middleware proxy handlers (`proxy.ts`) to validate database sessions. Admin routing validates both custom db session cookies and Clerk SSO tokens. If the Clerk user email matches `process.env.ADMIN_EMAIL` (defaulting to `warishlabs@gmail.com`), the user is authenticated as the super admin/owner of the site.

### 2. Immersive 3D Graphics
The hero canvas integrates a custom React Three Fiber orbital visual system:
- **Core Cube**: Interactive semi-transparent glass physical material mesh tilting on mouse gestures.
- **Orbital Rings**: Multi-axis wireframe torus rings surrounding the core.
- **Glow Nodes**: Satellite satellites orbiting the core dynamically using custom frame time animations.
- **Rotating Starfield**: Slow-spinning background point cloud generator.

### 3. Database Seeded Layout
Site configurations, homepage titles, statistics counters, FAQs, products catalog, categories, and technical stack badges are seeded and queried dynamically from PostgreSQL database schemas.

---

## Getting Started

### 1. Configure Local Environment
Create a `.env` file in the root of the project:
```bash
cp .env.example .env
```
Ensure PostgreSQL `DATABASE_URL` is set.
Add your Clerk API keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`).
Configure `ADMIN_EMAIL` (e.g. `warishlabs@gmail.com`).

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Sync & Seed Database
Use Prisma 7 commands to push the schema and run database seeding:
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Operations & Production Deployment

To package the application for optimized edge rendering:
```bash
npm run build
```
See [docs/Deployment.md](docs/Deployment.md) for more info on deploying database seeds, media configurations, and analytics pruner crons.
