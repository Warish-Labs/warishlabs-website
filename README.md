<p align="center">
  <img src="public/logo.gif" alt="WarishLabs Logo" width="120" height="120" />
</p>

<h1 align="center">WarishLabs Website</h1>

<p align="center">
  <em>Real Software Products for Real Problems.</em><br/>
  WarishLabs builds and ships web and Android apps used by real people, maintained by MD Warish Ansari.
</p>

<p align="center">
  <a href="https://warishlabs.in/" target="_blank">
    <img src="https://img.shields.io/badge/Live-warishlabs.in-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2d3748?style=for-the-badge&logo=prisma" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-00e5ff?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## ⚡ Technical Highlights

- **WebGL Canvas Background**: Full-bleed background Canvas rendering interactive 3D particle fields (Three.js + R3F) with mouse-repulsion physics, diagonal orbital rings, and dynamic floating shards.
- **Relational Seeded CMS**: Layout components (Hero, dynamic About paragraphs, Contact addresses) are fully decoupled and driven dynamically by a PostgreSQL database via Prisma ORM.
- **About Highlights CRUD Manager**: Allows admin configuration of values/about highlights cards with custom emoji support.
- **Dynamic Site Statistics**: Hides fake numbers and dynamically queries the database for actual values: **Total Site Visitors** (linked to unique tracking visitor IDs) and **Active Projects** (linked to product catalogs).
- **Robust Administrative Console**: Full operational CRUD dashboards for Categories, Products, Blog Articles, Media Uploads, Newsletter subscribers, and Activity Trails.
- **Blog Cover Image Upload**: Two-mode field (Paste Link | Upload File) with instant local blob preview before upload, real-time dimension probe, social-ratio aspect ratio helper, and seamless Cloudinary upload with retry on failure.
- **Media Library with Folder Browser**: Navigable Cloudinary folder tree with breadcrumb, per-folder asset grid showing Cloudinary-native dimensions (width, height, size), and copy/delete actions. Fully server-side — API secret never exposed to client.
- **Dynamic Cloud Folder Dropdown**: DB-backed `MediaFolder` records synced from Cloudinary. React Query-powered dropdown updates instantly after a "Sync Cloudinary" run — no page reload.
- **Real Cloudinary Folder Sync**: Recursive tree walk (`root_folders` → `sub_folders`) diffs against the local DB and returns `{ added, removed, unchanged }` in a detailed toast.
- **Dynamic Help Playbook**: Step-by-step console playbook built into the admin home interface explaining how to catalog products, preview products, and customize CMS settings.
- **Distributed Security rate-limiting**: Global Upstash Redis rate-limiter guards contacts, newsletter submissions, search, and tracking endpoints in `proxy.ts`, with custom rate limits on administrative routes (`/api/admin/*`). Falls back to local token buckets in development.
- **Clerk SSO & User Profile integration**: Managed through Clerk's secure dynamic `<UserButton />` in the header, letting the admin configure security options, manage active devices, and log out securely. Hidden from regular public users.
- **Sentry Monitoring & Session Replay**: Integrated error tracking and transaction profiling across browser, server, and edge runtimes, featuring real-time Session Replays and ad-blocker bypassing.
- **Microsoft Clarity Integration**: Capture high-fidelity session recordings and heatmaps in production using the official SDK.
- **Cloudflare Turnstile CAPTCHA**: Secure all public-facing submission forms (Contact form, Newsletter CTA, and Footer forms) client-side and server-side.
- **Legal Compliance Pages**: Completely pre-rendered static legal pages: **Privacy Policy** (`/privacy`), **Terms & Conditions** (`/terms`), **Cookie Policy** (`/cookies`), and **Disclaimer** (`/disclaimer`).
- **Communications Engine**: Includes tools to reply to visitor inquiries using Resend templates, compile HTML newsletter broadcast campaigns using Resend Batch API, and download client-side audience registry CSV files.
- **Centralized Multi-Tenant Visitor Analytics**: Neon PostgreSQL-backed cross-origin ingest API (`/api/analytics/event`) powering real-time visitor tracking and metrics dashboards for WarishLabs and all ecosystem subdomains (e.g. Toolkit). Includes copyable setup prompt generator for instant Antigravity integration into new projects. See [docs/CENTRAL_ANALYTICS_SETUP.md](docs/CENTRAL_ANALYTICS_SETUP.md).
- **Traffic Analytics Filters**: Extends traffic logs with date selectors (7 Days, 30 Days, 90 Days) and per-project filtering (Toolkit, WarishLabs, or All Ecosystem Projects).
- **Hardened SEO & Open Graph Banners**: Configures dynamic `sitemap.xml` listing blogs, products, and categories; Organization + Person JSON-LD schema; and Edge runtime-rendered dynamic Open Graph image banner generators (`/api/og`).
- **AI Agent Discoverability**: `public/llms.txt` index allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and other AI crawlers to discover products, blog content, and site structure.
- **No Repo Links Policy**: Product cards and detail pages never expose repository URLs to visitors. Live product links only — permanent architectural decision recorded in brain.md.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React 19 server-side rendering, routing, API endpoints |
| **Language** | TypeScript | Strong typing contracts |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma 7 | Typesafe schema modeling and queries |
| **Auth** | Clerk | Multi-tenant SSO authentication |
| **Media** | Cloudinary | Asset optimization, folder management, Admin API sync |
| **Email** | Resend | Transactional templates (Contact / Newsletters / Replies) |
| **Cache** | Redis (Upstash) | Global distributed rate-limiting sliding windows |
| **3D Graphics**| Three.js + R3F | Hardware-accelerated WebGL visuals |
| **Animation** | Framer Motion | Fluid spring transitions and hover micro-animations |
| **State** | React Query (TanStack) | Server state management, folder sync cache invalidation |
| **Sanitizer** | Isomorphic DOMPurify | Dynamic XSS sanitizer protection layer |
| **Monitoring** | Sentry SDK + Microsoft Clarity | Real-time error monitoring, profiling, session replays |
| **CAPTCHA** | Cloudflare Turnstile | Automated bot and spam protection |
| **Testing** | Vitest + jsdom | Fast utility unit tests and mocked DOM renders |

---

## 📂 Project Structure

```
├── .github/               # CI/CD and repository configurations
│   ├── workflows/         
│   │   └── ci.yml         # GitHub Actions CI workflow
│   ├── ISSUE_TEMPLATE/    # Issue report templates
│   ├── dependabot.yml     # Dependabot updates config
│   └── pull_request_template.md
├── app/                   # Next.js App Router root
│   ├── (admin)/           # Clerk-protected administration console
│   │   └── admin/         
│   │       ├── activity-logs/ # Operational audit trails
│   │       ├── analytics/     # Detailed visitor event tracking streams
│   │       ├── blog/          # Blog composer + cover image upload/link field
│   │       ├── categories/    # Classification CRUD
│   │       ├── dashboard/     # KPI panels, playbook guides & charts
│   │       ├── faqs/          # Public FAQ accordion CRUD
│   │       ├── homepage/      # Direct routing redirects to settings
│   │       ├── labs/          # Labs CRUD page
│   │       ├── login/         # Custom Sign-in routing
│   │       ├── media/         # Cloudinary folder browser, upload & sync
│   │       ├── newsletter/    # Subscriber lists & campaigns
│   │       ├── products/      # Products CRUD page
│   │       └── settings/      # Centralized CMS customizer settings
│   ├── api/               # Backend endpoint integrations
│   │   ├── admin/         # Clerk-secured administrative operations
│   │   │   ├── analytics/ # Traffic logs aggregates
│   │   │   ├── blog/      # Blog CRUD (now with coverImageWidth/Height)
│   │   │   ├── media/     # Assets: GET (default|folders|folder-contents), DELETE (id|publicId)
│   │   │   │   ├── upload/    # POST multipart upload → Cloudinary
│   │   │   │   └── sync/      # POST: recursive folder walk + DB diff
│   │   │   ├── messages/  # Inbound review & email reply routers
│   │   │   └── newsletter/# Custom broadcast campaigns & mailing
│   │   ├── og/            # Dynamic Edge banner image generator
│   │   ├── search/        # Public search API endpoint
│   │   └── stats/         # Dynamic homepage statistic numbers
│   ├── about/             # Dynamic laboratory profile
│   ├── categories/        # Classification Landscapes pages
│   ├── contact/           # Dynamic contact form & addresses
│   ├── cookies/           # Cookie Policy compliance page
│   ├── disclaimer/        # General Disclaimer compliance page
│   ├── global-error.tsx   # Sentry root client error boundary
│   ├── labs/              # Sandbox experiments page
│   ├── layout.tsx         # Main HTML layout wrapper (ClerkProvider)
│   ├── page.tsx           # CMS-driven homepage view
│   ├── privacy/           # Privacy Policy compliance page
│   ├── products/          # Showcased products page
│   ├── search/            # Dedicated search page route
│   └── terms/             # Terms & Conditions compliance page
├── components/            # UI components and 3D scenes
│   ├── admin/             # Admin topbar, sidebar, charts
│   │   ├── BlogCoverImageField.tsx  # Two-mode cover image (link|upload) with preview
│   │   ├── CloudFolderSelect.tsx    # Dynamic DB-backed folder dropdown
│   │   └── ...
│   ├── hero/              # Full-bleed Hero Canvas & Cube
│   └── ui/                # Base UI elements (including Turnstile)
├── docs/                  # Deployment & setup documentation (Gitignored)
├── prisma/                # Relational schema models and seed scripts
│   ├── schema.prisma      # Includes Blog (coverImageWidth/Height), MediaFolder
│   └── migrations/        # All applied migrations
├── services/              # Core business layers (Emails, Cloudinary, Products)
│   └── MediaService.ts    # Cloudinary: upload, delete, listFolders, walkAllFolders
├── tests/                 # Vitest test files & setups
│   └── services/
│       └── MediaService.test.ts  # Unit tests for folder walk, upload, delete
├── proxy.ts               # Next.js 16 Proxy Middleware (Rate limit & security headers)
├── instrumentation.ts     # Sentry startup instrumentation hook
├── instrumentation-client.ts # Sentry client-side configuration
├── sentry.server.config.ts # Sentry Node.js server configuration
└── sentry.edge.config.ts   # Sentry Edge runtime configuration
```

---

## 📋 Database Schema (Key Models)

| Model | Purpose |
|---|---|
| `Admin` | Admin user accounts (email, passwordHash) |
| `Session` | Admin session tokens |
| `Blog` | Blog posts with `coverImage`, `coverImageWidth?`, `coverImageHeight?` |
| `BlogSEO` | Per-post SEO metadata |
| `MediaAsset` | Cloudinary upload records (url, publicId, fileSize, mimeType) |
| `MediaFolder` | **[New]** Cloudinary folder paths synced from Admin API (`path`, `name`) |
| `Product` | SaaS product records with logoUrl, bannerUrl, category relation |
| `Category` | Product categories with SEO |
| `Lab` | Sandbox experiments / open-source projects |
| `SiteSetting` | Key-value CMS settings |
| `HomepageSection` | Editable homepage sections (hero, about, contact) |
| `SocialLink` | Admin-managed social platform links |
| `NewsletterSubscriber` | Email subscriber list |
| `ContactMessage` | Inbound contact form submissions |
| `ActivityLog` | Admin action audit trail |
| `Visitor` / `AnalyticsEvent` | Custom visitor tracking & event log |

---

## 🚀 Development Setup

### 1. Configure local environment
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/warishlabs"
ADMIN_EMAIL="warishlabs@gmail.com"
NEXT_PUBLIC_ADMIN_EMAIL="warishlabs@gmail.com"
CRON_SECRET="d3b07384d113edec49eaa6238ad5ff00"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Media Service (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key"

# Clerk Authentication Settings
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token"

# Sentry Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN="https://your-public-dsn@sentry.io/123"
SENTRY_DSN="https://your-private-dsn@sentry.io/123"
SENTRY_AUTH_TOKEN="sntrys_..."

# Cloudflare Turnstile Keys
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAA..."

# Microsoft Clarity Project ID
NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID="your_clarity_id"
```

> **Note:** No new environment variables are required for the media library or cover image features — all Cloudinary functionality uses the existing `CLOUDINARY_*` credentials.

### 2. Install dependencies
```bash
npm install
```

### 3. Initialize databases
Apply migrations and seed initial CMS layouts:
```bash
npx prisma migrate dev
npx -y tsx prisma/seed.ts
```

> **First-time Cloudinary setup:** After running the dev server, go to **Admin → Media** and click **Sync Cloudinary Folders** to pull your folder structure into the `MediaFolder` table. This populates the folder dropdown in the blog cover image uploader and media library.

### 4. Execute dev server
```bash
npm run dev
```
Open `http://localhost:3000` to review the application.

## 🧪 Testing

We use **Vitest** and **React Testing Library** for automated checks.

```bash
npm run test         # Run all tests once
npm run test:watch   # Run in watch mode
npm run ci:test      # Run the local verification pipeline (lint + typecheck + test + build)
```

**Test coverage includes:**
- `tests/services/MediaService.test.ts` — Cloudinary folder walk, upload, delete, asset listing, URL parsing
- `tests/services/ProductBlogSlugs.test.ts` — Product and Blog slug-based queries
- `tests/services/EmailService.test.ts` — Email service initialization
- `tests/utils/formatters.test.ts`, `slugify.test.ts` — Utility helpers
- `tests/components/hero/HeroSection.test.tsx` — Hero component rendering

---

## 🌍 Production Deployment & CI/CD Architecture

### 1. CI/CD Workflow
We use GitHub Actions to enforce strict quality gates before any code is merged into production.

```mermaid
graph TD
    A[Push / Pull Request] --> B[Install Dependencies npm ci]
    B --> C[Generate Prisma Client]
    C --> D[Run ESLint]
    D --> E[Run Typecheck]
    E --> F[Run Vitest Tests]
    F --> G[Build Application npm run build]
    G --> H[Run Security Audit npm audit]
    H --> I{All Passed?}
    I -- Yes --> J[Merge to main / Deploy to Vercel]
    I -- No --> K[Block Merge]
```

### 2. Branch & Git Strategy
- **`main`**: Protected production branch. Direct pushes to `main` are disabled.
- **Feature Branches**: Named `feat/*`, `fix/*`, or `chore/*`. Opened against `main` via Pull Requests.
- **PR Requisites**: Must pass the CI pipeline, receive approval, and resolve all conflicts before merge.
- **Merge Method**: Squash and merge to maintain a clean history.

### 3. Branch Protection Rules
Enable the following settings on your GitHub repository for `main`:
1. **Require status checks to pass before merging**: Enforce `CI` job completion.
2. **Require branches to be up to date before merging**.
3. **Restrict push access**: Only authorized service accounts/maintainers.

### 4. Dependabot & Security Scans
- **Dependabot**: Automatically scans `npm` packages and GitHub Actions weekly on Mondays. Packages are updated in grouped PRs, limited to 3 open PRs, and labeled with `dependencies`.
- **CodeQL SAST**: Performs weekly static analysis security testing for JavaScript and TypeScript to prevent code injections, XSS, and vulnerable patterns.

---

## 🔒 Configuration & Environment Variables

### Required GitHub Secrets
Configure the following secrets in GitHub Repository Settings (`Settings > Secrets and variables > Actions`):
- `DATABASE_URL`: Production PostgreSQL connection string.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key.
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key.
- `NEXT_PUBLIC_ADMIN_EMAIL`: Email address of the admin account.
- `CLERK_SECRET_KEY`: Clerk secret key.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.

### Required Vercel Environment Variables
Set the following environment variables in your Vercel Dashboard:
- `DATABASE_URL`, `DIRECT_URL`: Database connection pooler and direct migration URL.
- `ADMIN_EMAIL`, `NEXT_PUBLIC_ADMIN_EMAIL`.
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- `RESEND_API_KEY`.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
- `NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID`.
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`.
- `CRON_SECRET`.

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for guidelines, git workflow standards, and branch requirements.

---

## 🛡️ Security

To report security vulnerabilities, review the policies and responsible disclosure guidelines in [SECURITY.md](SECURITY.md).

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
