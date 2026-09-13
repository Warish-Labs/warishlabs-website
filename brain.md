# brain.md — WarishLabs Website

> **Last Updated:** 2026-09-13
> **Status:** Production-Ready (Compiled, Security-Hardened, Monitored & Tested)

---

## Changelog

### 2026-09-13 — Analytics System, Admin Hardening & Public-Page Follow-Ups (feat/analytics-admin-hardening-2026-09-13)

#### Phase A — Dependency & CI Policy
- PRs #23 (`actions/setup-node` 4→7) and #11 (`github/codeql-action` 3→4) verified and rebased.
- Conservative major bump policy: major version jumps (`eslint` 9→10, `vitest` 4→5, `@testing-library/jest-dom` 6→7, `@tanstack/react-table` 8→9, `typescript` 5.9.3→7.0.2) must be validated individually with full build + test passes before applying, rather than applied wholesale.

#### Phase B & F — Centralized Visitor Analytics System
- **Separate Neon Project Architecture**: Pointed `@prisma/analytics-client` at a dedicated, separate Neon PostgreSQL project (`ANALYTICS_DATABASE_URL` for runtime queries, `ANALYTICS_DIRECT_URL` for Prisma migrations). Main app DB and analytics DB are completely isolated with zero cross-database foreign keys.
- **Schema (`prisma/analytics.prisma`)**: Models `Project`, `Session`, `PageView`, and `Event` with indexes on `projectId`, `sessionId`, `createdAt`, and `path`.
- **Client & Services**: `CentralAnalyticsService.ts` handles session tracking (cookie token `warishlabs_vid`), User-Agent device/browser parsing, Vercel geo header extraction (`x-vercel-ip-country`), rate-limiting (Upstash Redis 60 req/min), project registration validation, and silent ingest failure handling.
- **Admin Analytics UI (`app/(admin)/admin/analytics/page.tsx`)**: Displays KPIs (total visitors, unique visitors, sessions, page views, today's visitors), recharts line chart for visitor trends, project breakdown, top pages, top referrers, and a Phase F **"Copy Setup Prompt for New Project"** button to copy integration instructions for external subdomains.

#### Phase C — Admin Panel Corrections
- **Products**: Removed GitHub repo URL field, fixed Category Group label binding (`category.name` instead of raw UUID), added Cloudinary image upload/preview for Brand Logo & Showcase Banner, added field tooltips (`components/ui/tooltip.tsx`), and verified SEO metadata persistence.
- **Categories**: Centralized Category model usage, added `PUT` endpoint for category edits (`/api/admin/categories`), and blocked deletion of categories with active products.
- **Blog**: Redesigned form into top section, added inline cover image upload/preview, added search & pagination to article catalog list.
- **Media Library**: Cloudinary sync auto-refresh on page load & folder list synchronization.
- **Broadcasting & Email Alerting**: Throttled broadcast email sends with 10-second batch delays (`EmailService.ts`). Added runtime failure alerting (`AlertService.ts`) with 15-minute de-duplication emailing `warishdeveloper@gmail.com` and `warishlabs@gmail.com` on Cloudinary/Clerk failures (falling back to Sentry/console if Resend fails).
- **Navigation & Layout**: Added topbar/sidebar "Back to WarishLabs Site" control in admin panel.

#### Phase D — Public-Page & Signature Distinction
- **Owner Signature Architecture**: Permanent distinction established:
  - **Machine-readable signature**: JSON-LD `Person` / `Organization` schema in `app/layout.tsx` and `public/llms.txt` MUST BE RETAINED for AI agent and crawler discoverability.
  - **Human-visible signature**: Visible badge/text on homepage footer removed per owner request. Do NOT re-add visible badges in future passes.
- **Hero & Blog UI**: Removed floating "ALL SYSTEMS OPERATIONAL" badge from hero (`HeroSection.tsx`). Removed "Filter by Category" dropdown from `/blog` (`BlogCatalog.tsx`), making search full-width.
- **SEO Audit**: All doc and legal pages (`/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/contact`, `/about`) export explicit `generateMetadata` with titles, descriptions, canonical URLs, and OpenGraph parameters.

---

### 2026-09-13 — Production Hardening & Rebrand (feat/production-hardening-and-rebrand-2026-09-13)

#### Phase 0 — Build Fix (Critical)
- **Root cause**: `prisma.config.ts` used `@prisma/config`'s `env()` helper, which fails on Vercel because Vercel injects env vars as `process.env` variables, not as a `.env` file. Fixed by reading `DATABASE_URL` directly from `process.env` with a clear throw if missing.
- **`lib/env.ts`** created: Zod-based startup validation that lists all missing required env vars at boot time instead of propagating opaque Prisma/Clerk/Cloudinary crashes.
- **`instrumentation.ts`** updated: calls `validateEnv()` in Node.js runtime path before Sentry init.
- **`.npmrc`** updated: added `allow-scripts` entries for `@clerk/shared`, `@prisma/engines`, `@sentry/cli`, `prisma`, `unrs-resolver` to eliminate CI noise.
- **Action required on Vercel**: ensure `DATABASE_URL`, Clerk keys, Cloudinary keys, and `RESEND_API_KEY` are all scoped to the **Production** environment in Vercel dashboard.

#### Phase 1 — AI Discoverability
- `public/llms.txt` created: plain-text index for AI agents.
- `app/layout.tsx`: Organization + Person JSON-LD, updated title/description to drop lab framing.
- `app/robots.ts`: explicit allow rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, CCBot.
- `app/sitemap.ts`: removed labs routes, added categories routes.

#### Phase 2 — Labs Removal
- **Architectural decision**: WarishLabs ships real products, not experiments. Labs positioning retired permanently.
- Deleted: `app/labs/page.tsx`, `app/(admin)/admin/labs/page.tsx`, `app/api/admin/labs/route.ts`, `components/labs/LabCard.tsx`, `components/labs/LabCatalog.tsx`.
- Prisma migration `20260913000000_drop_lab_open_source_remove_github_url`: drops `Lab` table, `OpenSourceProject` table, removes `githubUrl` from `Product`.
- **Architectural decision**: `githubUrl` removed from `Product` permanently — no repository links are ever shown to visitors. Live product links only.
- `/labs` → `/products` (301 redirect) added in `next.config.ts`.
- `Navbar.tsx`: nav order now Products → Blog → Categories → About → Contact.
- `AdminSidebar.tsx`: Labs entry removed.
- `constants/routes.ts`: Labs and OpenSourceProject route constants removed.

#### Phase 3 — Homepage
- HeroSection: `LABS · BUILD ACTIVE` badge → `LIVE PRODUCTS`, subtitle updated, status card copy updated, 50/50 grid split (6/6), `select-none` removed.
- Homepage section order: HeroSection → PopularToolsSection → CategoryGrid → LatestBlogPosts → StatsSection → WhyWarishLabs → FAQ → Newsletter.
- LatestBlogPosts: limit increased to 12, "View all articles" button added.

#### Phases 4-8 — UI Overhaul
- Products page: "Engineering Console" → "All Products", lab copy removed, Fuse.js fuzzy search + 300ms debounce, 3-col grid at xl.
- ProductCard: "Console details" → "View Details", category tag added.
- Categories: sorted by product count desc, `select-none` removed.
- Category detail: 3-col grid at xl, `select-none` removed.
- About page: lab framing removed from all copy, `LABORATORY PROFILE` → `ABOUT WARISHLABS`.
- Blog page: `ENGINEERING BULLETINS` → `GUIDES & ARTICLES`, `Technical Journal` → `Blog`, Fuse.js fuzzy search added.
- Global: `select-none` removed from all public `<main>` elements (products, blog, categories, about, contact, hero).
- Footer: `select-none` removed, attribution line added (MD Warish Ansari, LinkedIn, portfolio links).

---



WarishLabs is a modern, CMS-driven software product website for real, shipped software products — web and Android apps — built and maintained by MD Warish Ansari.

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Prisma ORM, PostgreSQL (Neon), Clerk SSO, Cloudinary, Resend transactional mail, Upstash Redis, Sentry SDK, Microsoft Clarity, Cloudflare Turnstile.
- **Base Style:** Slate Blue/Black glassmorphism cards and smooth custom micro-animations (Framer Motion).
- **Core Visuals:** Absolute full-bleed WebGL 3D canvas rendering mouse-reactive particle field layers (repulsion threshold < 2.5), orbital tori, data nodes, and scrolling lattice grid.

---

## 2. Dynamic Configurations & CMS Sections

Core pages are modular and editable from the **System Settings** dashboard panel (`/admin/settings`):

1. **Hero section** (`sectionType = 'hero'`):
   - Title, subtitle description, primary CTA text/redirection link.
2. **About section** (`sectionType = 'about'`):
   - Header titles, philosophy paragraphs list, dynamic highlights cards (staged, deleted, and edited with custom emoji support).
3. **Contact page** (`sectionType = 'contact'`):
   - Form parameters, response guarantee, secure routing, and direct contact details (email, phone, address).
   - Rendered using Next.js Server Side Rendering (forces dynamic load via `await cookies()`) for dynamic updates and instant crawler indexation.

---

## 3. Authentication & Middleware Router

To comply with Vercel's Edge runtime constraints and enable seamless administrative logins:

- **Middleware routing (`proxy.ts`)**:
  - The middleware is built on Clerk's `clerkMiddleware()` hook.
  - Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. We conform to this convention to ensure clean builds.
  - Automatically manages public and protected routes. Any request targeting `/admin/*` (except `/admin/login`) requires an active Clerk session (`userId` verification) or redirects directly to sign-in.
  - Generates and signs secure visitor tracking IDs in cookies (`warishlabs_visitor_id`).
  - Sets Content-Security-Policy (CSP) headers tailored for Google Tag Manager, Vercel Insights, Cloudinary assets, Turnstile verification script, Microsoft Clarity, and Clerk's SSO servers.
  - **No database queries** are made in the middleware to prevent Edge runtime database driver compilation crashes. Database-level owner validation is securely delegated to Server Components and admin API endpoints via `requireAdmin()`.

---

## 4. Rate-Limiting & Security Hardening

- **Sliding-Window Rate Limiter:** Checked within `proxy.ts` using Upstash Redis REST client (`@upstash/ratelimit`) matching endpoint keys:
  - `/api/contact`: Max 5 requests per hour.
  - `/api/newsletter/subscribe`: Max 5 requests per hour.
  - `/api/search`: Max 30 requests per minute.
  - `/api/analytics/event`: Max 60 requests per minute.
  - `/api/admin/*`: Protected with strict administrative rate limits (Max 60 requests per minute).
- **Local Fallback:** Falls back automatically to local in-memory token bucket rate limiters in development (or if Upstash variables are absent) to keep serverless functions working.
- **Security Headers & CSP:** Sets frames denial (`X-Frame-Options: DENY`), mime sniffing guards (`X-Content-Type-Options: nosniff`), Referrer Policy, HSTS, Permissions-Policy (disabling sensors/geolocation), and Cross-Origin policies (COOP, COEP, CORP) matching modern security ratings.
- **XSS Sanitization:** All dynamic description and content injections are sanitized with `isomorphic-dompurify` prior to dangerouslySetInnerHTML rendering.

---

## 5. Captcha Verification (Cloudflare Turnstile)

- **Reusable Component (`components/ui/Turnstile.tsx`):** Renders Turnstile widget client-side with script injection and dark theme matching the design, resetting on submission success or expiry.
- **Form Protection:** Contact Form (`ContactForm.tsx`), Newsletter Section (`NewsletterCTA.tsx`), and Footer bulletin subscriptions are protected. Submit buttons are locked until verification completes.
- **Server Verification (`lib/turnstile.ts`):** Validates the token against Cloudflare`s `siteverify` API on POST request processing, rejecting unauthorized, empty, or expired tokens.

---

## 6. Real-time Monitoring & Observability

- **Sentry SDK:** Error reporting and profiling client-side, server-side, and on edge runtimes. Bypasses ad-blockers using a rewritten `/monitoring` tunnel route.
- **Microsoft Clarity (`components/Clarity.tsx`):** Captures high-fidelity session replays and heatmaps in production. Dynamically loaded client-side to prevent SSR window reference crashes.

---

## 7. Legal Compliance & Footer

- **Privacy Policy (`/privacy`):** Fully drafted documentation specifying collected data and service vendors (Clerk, GA, Resend, Cloudinary, Neon, Upstash, Sentry).
- **Terms & Conditions (`/terms`):** Outlines usage guidelines, user responsibilities, and intellectual property conditions.
- **Cookie Policy (`/cookies`):** Explains cookie types, retention details, and management options.
- **Disclaimer (`/disclaimer`):** General portfolio disclaimer for testing sandboxes and SaaS tools.
- **Redesigned Footer (`Footer.tsx`):** Links resources, company info, actual products, and social media channels. Prevents crawl 404s by defaulting unconfigured social handles to empty strings.

---

## 8. CI/CD GitHub Pipeline Setup

- **Automated Workflow (`.github/workflows/ci.yml`):** Runs typecheck, linting, tests, and production build checks using Node.js 22 and npm caching on push/PRs.
- **Dependabot (`.github/dependabot.yml`):** Weekly audits for npm packages and GHA updates.
- **Templates:** PR templates, bug reports, feature requests, and `CODEOWNERS` are established.

---

## 9. Media Library & Cloudinary Integration (Updated 2026-07-06)

### New: Blog Cover Image Dimensions

The `Blog` model now stores optional `coverImageWidth` and `coverImageHeight` (nullable `Int` columns) to persist image dimensions at upload/paste time without re-fetching the image on every render. These are populated automatically by the `BlogCoverImageField` component on the admin blog page.

**Why:** Avoids re-loading images to determine dimensions for OG preview warnings and future layout hints.

### New: MediaFolder Model

A `MediaFolder` lookup table (`id, path, name, createdAt, updatedAt`) stores the list of Cloudinary folder paths synced from the Cloudinary Admin API. This is the backing data source for:
- The **Cloud Folder dropdown** (`components/admin/CloudFolderSelect.tsx`) used everywhere an upload destination folder must be selected.
- The **Media Library folder browser** that shows folders at the current navigation level.

**Important:** The `MediaFolder` table is a **lookup table only**. Deleting a folder entry from it (via sync) does NOT cascade to or delete any `Product`, `Blog`, or `MediaAsset` rows that reference a Cloudinary URL from that folder. Stored URLs remain valid.

### New: Real Cloudinary Folder Sync (`/api/admin/media/sync`)

The sync route was completely rebuilt. It now:
1. Calls `MediaService.walkAllFolders()` which recursively walks the full Cloudinary folder tree using breadth-first traversal (root_folders → sub_folders for each, level by level).
2. Diffs the result against the local `MediaFolder` DB table.
3. Inserts newly discovered folders, removes stale ones.
4. Returns `{ added: string[], removed: string[], unchanged: number }` for a detailed toast on the UI.

**No new environment variables required** — uses the same `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` as before.

### New: Dynamic Folder Endpoint (`GET /api/admin/media?type=folders`)

Returns all `MediaFolder` records from the database ordered by `path`. Used by `CloudFolderSelect` via React Query.

### New: Folder Contents Endpoint (`GET /api/admin/media?type=folder-contents&path=<path>`)

Returns Cloudinary assets inside a specific folder (width, height, bytes, format, url) via `MediaService.listFolderAssets()`. All Cloudinary Admin API calls are server-side — the API secret is never exposed to the client.

### New: Blog Cover Image Field (`components/admin/BlogCoverImageField.tsx`)

Two-mode cover image input (Paste Link | Upload File):
- **Link mode:** debounced URL probe with `new Image()` onload/onerror, shows dimensions + aspect ratio, amber warning if ratio deviates >15% from 1.91:1 social standard.
- **Upload mode:** Instant local blob preview via `URL.createObjectURL`, reads dimensions before network upload, then swaps to Cloudinary URL on success. Retry button on failure. Enforces 5MB max / image mimetype on client.

### Branch Hygiene (2026-07-06)

Deleted 7 stale branches (all fully merged into main, 0 unmerged commits):
- `feat/gtm`, `feature/analytics`, `feature/newsletter`, `feature/social-links-admin` (local + remote)
- `fix/products-blog-slug`, `fix/search` (local + remote)
- `fix/ci-cd-production` (local only — remote already pruned)
