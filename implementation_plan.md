# WarishLabs — Production Website Implementation Plan

> **Scope**: Build the complete production-ready WarishLabs platform from scratch — a Next.js 15 full-stack application with an immersive 3D hero, CMS-driven content, admin dashboard, internal analytics, and enterprise-grade security.

---

## Current State

The repository contains only:
- `Docs/` — Three specification documents (Product Blueprint, Tech Architecture, Design System) + logo assets (JPG/PNG/SVG/WebP) + video (MP4)
- `.gitignore` — Pre-configured for Next.js
- `README.md` — Placeholder ("# WarishLabs_Website")

**Everything must be built from scratch.**

---

## Conflict Resolutions & User Decisions

Following detailed review, the following decisions are locked in for the implementation:

1. **Authentication & Session Management**:
   - **Decision**: Implement **database-backed session management** (not stateless JWTs) to support immediate server-side revocation on logout. 
   - A `Session` model will be created in the Prisma schema, linking active sessions to the `Admin` user.
   - Session tokens will be secure random UUIDs/secrets stored in HTTP-only, secure, SameSite=Lax cookies.

2. **Tailwind CSS Version**:
   - **Decision**: Use **Tailwind CSS v4** with the new CSS-first configuration approach, using `@theme` directives in `globals.css` as specified in Docs 02 & 03.

3. **Database Settings**:
   - **Decision**: Configure local PostgreSQL for development (`warishlabs` database, password `Warish@786`) with seed script credentials derived from environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`). Production uses Neon.

4. **3D Hero Cube**:
   - **Decision**: Abstract engineering cube with floating tech icons on/around faces (no company logo on the faces to avoid a loading-screen appearance).

5. **External Tracking (GA + Clarity)**:
   - **Decision**: Placeholder env vars only. No third-party analytics scripts will be loaded or run in v1.

6. **Rich Text Editor**:
   - **Decision**: Tiptap Free Tier.

7. **Documentation Scope**:
   - **Decision**: Streamlined to 3 mandatory files to avoid documentation debt: `README.md`, `docs/Development.md`, and `docs/Deployment.md`. The rest are omitted.

8. **Homepage Section to Product Relation**:
   - **Decision**: Completely decoupled. The `HomepageSection` will store references to product IDs in its JSON config field rather than having a foreign key relation or DB-level coupling.

---

## Architecture & Security Gaps Resolved

### 1. Rate Limiting Architecture
To handle Vercel's multi-instance serverless deployments, rate limiting is structured as follows:
- **Production**: Upstash Redis-based rate limiting via `@upstash/ratelimit` in the middleware.
- **Development**: In-memory token bucket fallback (clearly marked as dev-only).
- **Thresholds**:
  - `POST /api/contact`: 5 requests per hour per IP.
  - `POST /api/newsletter/subscribe`: 5 requests per hour per IP.
  - `GET /api/search`: 30 requests per minute per IP.
  - `POST /api/analytics/event`: 60 requests per minute per session.

### 2. AnalyticsEvent Retention Policy
To prevent performance degradation over time on Neon/PostgreSQL:
- An `AnalyticsEvent` cleanup task will be written as a Server Action/API route (secured via CRON secret).
- It will execute a query to delete all `AnalyticsEvent` records older than 90 days:
  ```prisma
  // Pseudo-code for cleanup query
  prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } }
  })
  ```
- This task will be documented in `docs/Deployment.md` to be scheduled daily (e.g., via Vercel Cron Jobs).

---

## Technology Stack (Final)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | Latest |
| Icons | Lucide React | Latest |
| Animations | Framer Motion | Latest |
| 3D/WebGL | Three.js + React Three Fiber + Drei + Postprocessing | Latest |
| Forms | React Hook Form | Latest |
| Validation | Zod | Latest |
| Tables | TanStack Table | v8 |
| Data Fetching | TanStack Query | v5 |
| State | Zustand | Latest |
| Charts | Recharts | Latest |
| Rich Text | Tiptap (open source) | Latest |
| ORM | Prisma | Latest |
| Database | PostgreSQL (local dev) / Neon (prod) | 16+ |
| Media | Cloudinary | SDK v2 |
| Email | Resend (primary) + Nodemailer (fallback) | Latest |
| Fonts | Geist + Geist Mono | via `next/font` |
| Rate Limiting | Upstash Redis | `@upstash/ratelimit` |

---

## Proposed Changes

### Phase 1: Project Scaffolding & Design System Foundation

Establish project skeleton, configuration, and design system tokens.

---

#### [NEW] Project Initialization
```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --use-npm
```

#### [NEW] Core Dependencies
```bash
# UI & Components
npm i framer-motion lucide-react @tanstack/react-query @tanstack/react-table zustand recharts
npm i react-hook-form @hookform/resolvers zod
npm i class-variance-authority clsx tailwind-merge

# 3D
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing

# Database & Backend
npm i @prisma/client bcryptjs jsonwebtoken resend nodemailer cloudinary @upstash/redis @upstash/ratelimit

# Rich Text
npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-code-block-lowlight

# Dev Dependencies
npm i -D @types/three @types/bcryptjs @types/jsonwebtoken @types/nodemailer prisma @next/bundle-analyzer
```

#### [NEW] shadcn/ui Initialization
```bash
npx -y shadcn@latest init
```
Add components: button, input, textarea, select, dialog, dropdown-menu, sheet, table, tabs, badge, card, tooltip, separator, skeleton, switch, accordion, command, popover, toast, avatar, label, progress, scroll-area, alert-dialog.

---

#### [NEW] `src/styles/globals.css`
Color tokens, typography scale, spacing system, border radius, shadows, and glow effects from Doc 03. Tailwind v4 CSS-first configuration.

#### [NEW] `src/constants/motion.ts`
Framer Motion animation presets (`SPRING_DEFAULT`, `SPRING_GENTLE`, `FADE_UP`, `SCALE_IN`, etc.).

#### [NEW] `src/constants/events.ts`
Analytics event name constants.

#### [NEW] `src/constants/routes.ts`
Type-safe route paths.

#### [NEW] `src/constants/config.ts`
File limits, rate limit configs, cookie names.

#### [NEW] `src/utils/cn.ts`
Class merger utility.

#### [NEW] `src/utils/formatters.ts`
Number and date formatters.

#### [NEW] `src/utils/slugify.ts`
URL slug generator.

#### [NEW] `tsconfig.json`
Strict TypeScript compiler options.

#### [NEW] `next.config.ts`
Config with Cloudinary domains, security headers, and bundle analyzer.

---

### Phase 2: Database Schema & Prisma

All models, enums, relations, indexes, seed data, and migrations.

---

#### [NEW] `prisma/schema.prisma`
Prisma schema including DB-backed session tracking:
- `Admin`: Admin details.
- `Session`: Database-backed sessions containing `id`, `adminId`, `token`, `expiresAt`, `createdAt`.
- `Product`: Decoupled from `HomepageSection`.
- `Category`, `Technology`, `ProductTechnology`, `ProductMedia`, `ProductSEO`, `CategorySEO`, `Blog`, `BlogSEO`.
- `ContactMessage`, `NewsletterSubscriber`.
- `Visitor`, `AnalyticsEvent` (with comments indicating the 90-day deletion rule).
- `MediaAsset`, `HomepageSection` (stores list of featured product slugs/IDs in JSON config).
- `NavItem`, `SiteSetting`, `ActivityLog`, `FAQ`, `ProductFAQ`, `Lab`, `OpenSourceProject`.

#### [NEW] `prisma/seed.ts`
Database seed script using env credentials.

#### [NEW] `src/lib/prisma.ts`
Prisma client singleton.

---

### Phase 3: Authentication & Middleware

Custom DB session auth and rate limiting.

---

#### [NEW] `src/lib/auth.ts`
Utilities to create/validate/revoke sessions using the database.

#### [NEW] `src/middleware.ts`
Middleware handling:
- Admin route validation against database sessions.
- Visitor session tracking.
- Security headers.
- Upstash Redis rate limiting.

#### [NEW] `src/app/(admin)/admin/login/page.tsx`
Admin login UI.

#### [NEW] `src/features/auth/actions/login.ts`
Server action validating admin credentials and creating a DB session.

#### [NEW] `src/features/auth/actions/logout.ts`
Server action destroying the DB session and clearing cookies.

---

### Phase 4: Service Layer & Core API

Business logic services.

---

#### [NEW] `src/services/EmailService.ts`
Transactional email provider wrapper (Resend/SMTP).

#### [NEW] `src/services/MediaService.ts`
Cloudinary wrapper.

#### [NEW] `src/services/AnalyticsService.ts`
Internal analytics and event retention task.

#### [NEW] `src/lib/cloudinary.ts` & `src/lib/resend.ts`
Config singletons.

#### Feature Services:
- `ProductService`, `BlogService`, `CategoryService`, `ContactService`, `NewsletterService`, `FAQService`, `HomepageService`, `NavigationService`, `SettingsService`, `MediaLibraryService`, `SearchService`, `AnalyticsDashboardService`, `LabService`, `OpenSourceService`.

---

### Phase 5: Public Pages & 3D Hero Experience

Visitor frontend.

---

#### [NEW] Common Layout Components:
- Navbar, Footer, SearchPanel (Command-K), PageTransition, ScrollProgress, SkipToContent, CursorGlow.

#### [NEW] 3D Hero System:
- `HeroSection`, `HeroCanvas`, `HeroCube` (abstract R3F cube with hover tilt and floating tech icons), `HeroLighting`, `HeroBackground`, `FloatingTechCards`, `HeroContent`, `ParticleField`.

#### [NEW] Homepage Sections (CMS-driven):
- FeaturedSpotlight, CategoryGrid, LatestProducts, FeaturedProducts, StatsSection, WhyWarishLabs, OpenSourceShowcase, LatestBlogPosts, FAQSection, NewsletterSection, ContactCTA, HomepageSectionRenderer.

#### [NEW] Public Page Routes:
- `/`, `/products`, `/products/[slug]`, `/categories`, `/categories/[slug]`, `/blog`, `/blog/[slug]`, `/labs`, `/open-source`, `/about`, `/contact`, `/search`.

---

### Phase 6: Admin Dashboard & CMS

Admin UI matching the Vercel-meets-Linear aesthetic.

---

#### [NEW] Admin Shared Components:
- `AdminSidebar`, `AdminTopbar`, `DataTable`, `MediaUploader`, `RichTextEditor` (Tiptap free), `DragReorder`.

#### [NEW] Admin Page Routes:
- `/admin/dashboard`, `/admin/homepage`, `/admin/products`, `/admin/categories`, `/admin/technologies`, `/admin/blog`, `/admin/labs`, `/admin/open-source`, `/admin/media`, `/admin/messages`, `/admin/newsletter`, `/admin/faqs`, `/admin/navigation`, `/admin/seo`, `/admin/analytics`, `/admin/visitors`, `/admin/activity-logs`, `/admin/settings`, `/admin/system`.

---

### Phase 7: API Route Handlers

Client-side API endpoints.

---

#### [NEW] API Routes:
- `/api/search` (GET)
- `/api/contact` (POST)
- `/api/newsletter/subscribe` (POST)
- `/api/newsletter/unsubscribe` (POST)
- `/api/analytics/event` (POST)
- `/api/media/upload` (POST, Admin-only)
- `/api/analytics/cleanup` (POST, secured CRON endpoint to delete events >90 days old)

---

### Phase 8: SEO & Performance

#### [NEW] SEO Files:
- `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`

---

### Phase 9: Documentation & Cleanup

Documentation is reduced to the three critical files.

---

#### [NEW] Documentation:
- `README.md` (fully rewritten overview, architecture, quickstart, setup, features)
- `docs/Development.md` (local prerequisites, DB config, env vars setup, seed workflow)
- `docs/Deployment.md` (Vercel deployment setup, Cloudinary, Upstash Redis configuration, CRON job configuration for analytics event retention)
- `.env.example` (documented template for all env secrets)

---

### Phase 10: Final Verification

#### Verification Strategy & Targets:
- **Production Build**: `npm run build` must compile with zero errors/warnings.
- **TypeScript**: `npx tsc --noEmit` must pass with zero issues.
- **Linting**: `npm run lint` must pass.
- **Database & Seed**: `prisma db push` and `prisma db seed` run successfully.
- **Lighthouse Performance Targets**:
  - **Performance**: ≥ 90
  - **Accessibility**: ≥ 95
  - **Best Practices**: ≥ 90
  - **SEO**: ≥ 95

---

## Conflict Resolutions & Security Log

| Gaps / Issue | Action Taken | Rationale |
|---|---|---|
| **Rate Limiting Gaps** | Upstash Redis implementation in Middleware | Essential for Vercel Serverless multi-instance setup |
| **Analytics Bloat** | `/api/analytics/cleanup` endpoint + 90-day retention | Prevents Neon PostgreSQL performance death at scale |
| **Session Invalidation** | DB Session tracking via a `Session` model | Allows immediate server-side revocation on logout |
| **Coupled ER Schema** | decoupled `HomepageSection` product array in JSON | Simplifies queries, prevents strict FK dependency problems |
| **Docs Bloat** | Reduced to `README.md`, `Development.md`, `Deployment.md` | Keeps implementation lean, focusing effort on software quality |
