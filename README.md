<p align="center">
  <img src="public/logo.gif" alt="WarishLabs Logo" width="120" height="120" />
</p>

# WarishLabs Website

> Seriousness in Engineering, Modern Product Thinking. An engineering-first software laboratory showcasing premium SaaS platforms, developer tools, and interactive WebGL canvas playgrounds.

**Live URL:** [warishlabs.vercel.app](https://warishlabs.vercel.app/)  
**Canonical Domain:** [warishlabs.in](https://warishlabs.in/)

---

## ⚡ Technical Highlights

- **WebGL Canvas Playground**: Full-bleed background Canvas rendering interactive 3D particle fields (Three.js + R3F) with mouse-repulsion physics, diagonal orbital rings, and dynamic floating shards.
- **Relational Seeded CMS**: Layout components (Hero, dynamic About paragraphs, Contact addresses) are fully decoupled and driven dynamically by a PostgreSQL database via Prisma ORM.
- **Dynamic Site Statistics**: Hides fake numbers and dynamically queries the database for actual values: **Total Site Visitors** (linked to unique tracking visitor IDs) and **Active Projects** (linked to product catalogs).
- **Robust Administrative Console**: Full operational CRUD dashboards for Categories, Products, Sandbox Labs, Blog Articles, Media Uploads, Newsletter subscribers, and Activity Trails.
- **Dynamic Help Playbook**: Step-by-step console playbook built into the admin home interface explaining how to catalog products, preview sandbox labs, and customize CMS settings.
- **Distributed Security rate-limiting**: Global Upstash Redis rate-limiter guards contacts, newsletter submissions, and tracking endpoints, falling back to local token buckets in development.
- **Clerk SSO & User Profile integration**: Managed through Clerk's secure dynamic `<UserButton />` in the header, letting the admin configure security options, manage active devices, and log out securely. Hidden from regular public users.
- **Media Asset Sync**: Automatically manages Cloudinary folder uploads (`warishlabs/products`, `warishlabs/labs`) and cleans up associated assets on delete.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React 19 server-side rendering, routing, API endpoints |
| **Language** | TypeScript | Strong typing contracts |
| **Database** | PostgreSQL | Relational transactional database |
| **ORM** | Prisma | Typesafe schema modeling and queries |
| **Auth** | Clerk | Multi-tenant SSO authentication |
| **Media** | Cloudinary | Asset optimization and folder management |
| **Email** | Resend | Transactional templates (Contact / Newsletters) |
| **Cache** | Redis (Upstash) | Global distributed rate-limiting sliding windows |
| **3D Graphics**| Three.js + R3F | Hardware-accelerated WebGL visuals |
| **Animation** | Framer Motion | Fluid spring transitions and hover micro-animations |
| **Testing** | Vitest + jsdom | Fast utility unit tests and mocked DOM renders |

---

## 📂 Project Structure

```
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
│   │       ├── newsletter/    # Subscriber lists
│   │       ├── products/      # Products CRUD page
│   │       └── settings/      # Centralized CMS customizer settings
│   ├── api/               # Backend endpoint integrations
│   ├── about/             # Dynamic laboratory profile
│   ├── contact/           # Dynamic contact form & addresses
│   ├── labs/              # Sandbox showcases
│   └── products/          # Showcased platforms
├── components/            # UI components and 3D scenes
│   ├── admin/             # Admin topbar (Clerk UserButton), sidebar, charts
│   ├── hero/              # Full-bleed Hero Canvas & Cube
│   └── ui/                # Base UI elements
├── docs/                  # Deployment & setup documentation (Gitignored)
├── prisma/                # Relational schema models and seed scripts
├── services/              # Core business layers (Emails, Cloudinary, Products)
├── tests/                 # Vitest test files & setups
└── proxy.ts               # Security middleware & rate limit routing
```

---

## 🚀 Development Setup

### 1. Configure local environment
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/warishlabs"
ADMIN_EMAIL="warishlabs@gmail.com"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
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

---

## 🧪 Testing

We use **Vitest** and **React Testing Library** for automated checks.

```bash
npm run test:run     # Run all tests once
npm run test         # Run in watch mode
```

---

## 🌍 Production Deployment

For full deployment instructions (Neon DB poolers, DNS CNAME setups, Clerk configurations), refer to:
👉 [Vercel Deployment Guide](file:///home/md-warish-ansari/Projects/warishlabs-website/docs/VERCEL_DEPLOYMENT.md)
