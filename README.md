<p align="center">
  <img src="public/logo.gif" alt="WarishLabs Logo" width="120" height="120" />
</p>

# WarishLabs Website

[![CI](https://github.com/warishlabs/warishlabs-website/actions/workflows/ci.yml/badge.svg)](https://github.com/warishlabs/warishlabs-website/actions/workflows/ci.yml)
[![Vercel Deployment](https://therealsujitk-vercel-badge.vercel.app/?app=warishlabs)](https://warishlabs.vercel.app/)

> Seriousness in Engineering, Modern Product Thinking. An engineering-first software laboratory showcasing premium SaaS platforms, developer tools, and interactive WebGL canvas playgrounds.

**Live URL:** [https://warishlabs.in/](https://warishlabs.in/)  
**Canonical Domain:** [warishlabs.in](https://warishlabs.in/)

---

## ⚡ Technical Highlights

- **WebGL Canvas Playground**: Full-bleed background Canvas rendering interactive 3D particle fields (Three.js + R3F) with mouse-repulsion physics, diagonal orbital rings, and dynamic floating shards.
- **Relational Seeded CMS**: Layout components (Hero, dynamic About paragraphs, Contact addresses) are fully decoupled and driven dynamically by a PostgreSQL database via Prisma ORM.
- **About Highlights CRUD Manager**: Allows admin configuration of values/about highlights cards with custom emoji support.
- **Dynamic Site Statistics**: Hides fake numbers and dynamically queries the database for actual values: **Total Site Visitors** (linked to unique tracking visitor IDs) and **Active Projects** (linked to product catalogs).
- **Robust Administrative Console**: Full operational CRUD dashboards for Categories, Products, Sandbox Labs, Blog Articles, Media Uploads, Newsletter subscribers, and Activity Trails.
- **Dynamic Help Playbook**: Step-by-step console playbook built into the admin home interface explaining how to catalog products, preview sandbox labs, and customize CMS settings.
- **Distributed Security rate-limiting**: Global Upstash Redis rate-limiter guards contacts, newsletter submissions, search, and tracking endpoints in `proxy.ts`, with custom rate limits on administrative routes (`/api/admin/*`). Falls back to local token buckets in development.
- **Clerk SSO & User Profile integration**: Managed through Clerk's secure dynamic `<UserButton />` in the header, letting the admin configure security options, manage active devices, and log out securely. Hidden from regular public users.
- **Sentry Monitoring & Session Replay**: Integrated error tracking and transaction profiling across browser, server, and edge runtimes, featuring real-time Session Replays and ad-blocker bypassing.
- **Microsoft Clarity Integration**: Capture high-fidelity session recordings and heatmaps in production using the official SDK.
- **Cloudflare Turnstile CAPTCHA**: Secure all public-facing submission forms (Contact form, Newsletter CTA, and Footer forms) client-side and server-side.
- **Legal Compliance Pages**: Completely pre-rendered static legal pages: **Privacy Policy** (`/privacy`), **Terms & Conditions** (`/terms`), **Cookie Policy** (`/cookies`), and **Disclaimer** (`/disclaimer`).
- **Media Asset Sync**: Automatically manages Cloudinary folder uploads (`warishlabs/products`, `warishlabs/labs`), cleans up associated assets on delete, and reconciles DB records with Cloudinary asset registries via dynamic Cloudinary Admin API synchronization.
- **Communications Engine**: Includes tools to reply to visitor inquiries using Resend templates, compile HTML newsletter broadcast campaigns using Resend Batch API, and download client-side audience registry CSV files.
- **Traffic Analytics Filters**: Extends traffic logs with date selectors (7 Days, 30 Days, All Time) and referral source channel breakdowns (Google Search, GitHub, LinkedIn, X/Twitter).
- **Hardened SEO & Open Graph Banners**: Configures dynamic `sitemap.xml` listing blogs, products, and labs, organization schema JSON-LD metadata, and Edge runtime-rendered dynamic Open Graph image banner generators (`/api/og`).

---

## 🛠 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React 19 server-side rendering, routing, API endpoints |
| **Language** | TypeScript | Strong typing contracts |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Typesafe schema modeling and queries |
| **Auth** | Clerk | Multi-tenant SSO authentication |
| **Media** | Cloudinary | Asset optimization and folder management |
| **Email** | Resend | Transactional templates (Contact / Newsletters / Replies) |
| **Cache** | Redis (Upstash) | Global distributed rate-limiting sliding windows |
| **3D Graphics**| Three.js + R3F | Hardware-accelerated WebGL visuals |
| **Animation** | Framer Motion | Fluid spring transitions and hover micro-animations |
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
│   │       ├── blog/          # Blog composer CRUD
│   │       ├── categories/    # Classification CRUD
│   │       ├── dashboard/     # KPI panels, playbook guides & charts
│   │       ├── faqs/          # Public FAQ accordion CRUD
│   │       ├── homepage/      # Direct routing redirects to settings
│   │       ├── labs/          # Labs CRUD page
│   │       ├── login/         # Custom Sign-in routing
│   │       ├── media/         # Cloudinary gallery view & deletion tools
│   │       ├── newsletter/    # Subscriber lists & campaigns
│   │       ├── products/      # Products CRUD page
│   │       └── settings/      # Centralized CMS customizer settings
│   ├── api/               # Backend endpoint integrations
│   │   ├── admin/         # Clerk-secured administrative operations
│   │   │   ├── analytics/ # Traffic logs aggregates
│   │   │   ├── media/     # Assets upload & sync controllers
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
│   ├── admin/             # Admin topbar (Clerk UserButton), sidebar, charts
│   ├── hero/              # Full-bleed Hero Canvas & Cube
│   └── ui/                # Base UI elements (including Turnstile)
├── docs/                  # Deployment & setup documentation (Gitignored)
├── prisma/                # Relational schema models and seed scripts
├── services/              # Core business layers (Emails, Cloudinary, Products)
├── tests/                 # Vitest test files & setups
├── proxy.ts               # Next.js 16 Proxy Middleware (Rate limit & security headers)
├── instrumentation.ts     # Sentry startup instrumentation hook
├── instrumentation-client.ts # Sentry client-side configuration
├── sentry.server.config.ts # Sentry Node.js server configuration
└── sentry.edge.config.ts   # Sentry Edge runtime configuration
```

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

### 2. Install dependencies
```bash
npm install
```

### 3. Initialize databases
Apply migrations and seed initial CMS layouts:
```bash
npx prisma db push
npx -y tsx prisma/seed.ts
```

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


---

## 🌍 Production Deployment

For full deployment instructions (Neon DB poolers, DNS CNAME setups, Clerk configurations), refer to:
👉 [Vercel Deployment Guide](file:///home/md-warish-ansari/Projects/warishlabs-website/docs/VERCEL_DEPLOYMENT.md)

---

## 🏗️ Production Architecture

The application is engineered as a highly resilient, modern web system:
- **Hosting & Edge Routing**: Hosted on Vercel with serverless and Edge handler execution, ensuring sub-100ms global latency.
- **Relational Datastore**: Neon Serverless PostgreSQL with pg poolers, optimized for dynamic schemas and low connection times.
- **Caching & Rate Limiting**: Global Upstash Redis instance managing real-time API call rate thresholds client-side and server-side.
- **Media CDN**: Cloudinary serves highly compressed images and files using global edge CDNs.
- **Identity & Authentication**: Clerk SSO manages administrative sessions.

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](file:///home/md-warish-ansari/Projects/warishlabs-website/CONTRIBUTING.md) guide for guidelines, git workflow standards, and branch requirements.

---

## 🛡️ Security

To report security vulnerabilities, review the policies and responsible disclosure guidelines in [SECURITY.md](file:///home/md-warish-ansari/Projects/warishlabs-website/SECURITY.md).

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](file:///home/md-warish-ansari/Projects/warishlabs-website/LICENSE) for details.

