# WarishLabs — Technical Architecture & Development Blueprint
**Version 2.0 — Enhanced**

---

## Project Philosophy

WarishLabs is a long-term software ecosystem, not a personal website.

- The **frontend** is a presentation layer only
- The **backend** is a CMS that controls all visible content
- The **database** is the single source of truth for everything
- The **Admin Panel** controls every section, page, product, blog, navigation item, SEO field, and setting
- **No visible content is hardcoded** in the application

Adding a new product should require zero frontend code changes.

---

## Technology Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Component Library | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| 3D / WebGL | Three.js + React Three Fiber |
| Forms | React Hook Form |
| Validation | Zod |
| Tables | TanStack Table v8 |
| Data Fetching | TanStack Query v5 |
| State Management | Zustand |
| Charts | Recharts |
| Rich Text Editor | Tiptap |

### Backend

| Layer | Technology |
|---|---|
| Framework | Next.js Route Handlers + Server Actions |
| No separate backend server | Everything lives inside the Next.js application |
| API style | RESTful Route Handlers for external, Server Actions for internal |

### Database

| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| Hosting | Neon (serverless PostgreSQL) |
| ORM | Prisma |
| Migrations | Prisma Migrate |

Database should be fully normalized. No duplicated data. Foreign key relationships enforced at the database level.

### Media

| Layer | Technology |
|---|---|
| Provider | Cloudinary |
| Storage strategy | Folder-based structure (see Media section) |
| Database storage | Only Cloudinary URLs stored — never raw files |

### Authentication

| Aspect | Detail |
|---|---|
| Current version | Single Super Admin |
| Method | Email + Password |
| Session | Secure HTTP-only cookie |
| Public accounts | None in v1 |
| Future roles | Admin, Editor, Author, Moderator |

Architecture already supports role expansion without database redesign. The role/permission model is table-driven, not hardcoded.

### Email

| Provider | Usage |
|---|---|
| Resend (Primary) | All transactional emails |
| Nodemailer + Gmail SMTP (Fallback) | Backup when Resend unavailable |

An `EmailService` abstraction layer wraps the provider. Switching providers requires only updating the service, not business logic.

**Email types:**
- Contact form confirmation (to visitor)
- Admin notification (new message received)
- Newsletter welcome
- Product announcement
- Password reset (future)

### Deployment

| Service | Provider |
|---|---|
| Frontend + Backend | Vercel |
| Database | Neon |
| Media | Cloudinary |
| Analytics (external) | Google Analytics + Microsoft Clarity |
| Analytics (internal) | Custom engine (this codebase) |

---

## Folder Structure

```
src/
├── app/
│   ├── (public)/               # Public-facing pages
│   │   ├── page.tsx            # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── labs/
│   │   ├── open-source/
│   │   ├── about/
│   │   ├── contact/
│   │   └── search/
│   │
│   ├── (admin)/                # Protected admin pages
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── homepage/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── technologies/
│   │       ├── blog/
│   │       ├── labs/
│   │       ├── open-source/
│   │       ├── media/
│   │       ├── messages/
│   │       ├── newsletter/
│   │       ├── faqs/
│   │       ├── navigation/
│   │       ├── seo/
│   │       ├── analytics/
│   │       ├── visitors/
│   │       ├── activity-logs/
│   │       ├── settings/
│   │       └── system/
│   │
│   ├── api/
│   │   ├── analytics/
│   │   ├── search/
│   │   ├── newsletter/
│   │   ├── contact/
│   │   └── sitemap/
│   │
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── common/                 # Shared layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchPanel.tsx
│   │   └── AnnouncementBar.tsx
│   └── shared/                 # Reusable business components
│       ├── ProductCard.tsx
│       ├── BlogCard.tsx
│       ├── CategoryCard.tsx
│       ├── TechBadge.tsx
│       └── StatCounter.tsx
│
├── features/
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── types/
│   ├── blogs/
│   ├── analytics/
│   ├── contact/
│   ├── newsletter/
│   ├── faq/
│   ├── media/
│   ├── search/
│   ├── navigation/
│   ├── homepage/
│   └── settings/
│
├── hooks/                      # Global reusable hooks
│   ├── useDebounce.ts
│   ├── useIntersectionObserver.ts
│   ├── useAnalytics.ts
│   └── useMediaQuery.ts
│
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   ├── cloudinary.ts           # Cloudinary config
│   ├── resend.ts               # Email provider
│   ├── analytics.ts            # Analytics tracker
│   └── auth.ts                 # Auth utilities
│
├── services/                   # Shared services used across features
│   ├── EmailService.ts
│   ├── AnalyticsService.ts
│   └── MediaService.ts
│
├── server/
│   └── actions/                # Global server actions
│
├── types/
│   ├── product.ts
│   ├── blog.ts
│   ├── analytics.ts
│   └── index.ts
│
├── utils/
│   ├── formatters.ts
│   ├── slugify.ts
│   ├── cn.ts
│   └── constants.ts
│
├── constants/
│   ├── events.ts               # Analytics event names
│   ├── routes.ts
│   └── config.ts
│
├── providers/
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   └── AnalyticsProvider.tsx
│
├── config/
│   ├── site.ts
│   └── navigation.ts
│
├── styles/
│   └── globals.css
│
├── middleware/
│   └── middleware.ts           # Auth + rate limiting
│
└── schemas/
    ├── product.schema.ts
    ├── blog.schema.ts
    ├── contact.schema.ts
    └── newsletter.schema.ts
```

---

## Architecture Pattern

```
Browser / Client
      ↓
Next.js React Components
      ↓
Server Actions (mutations) / Route Handlers (API)
      ↓
Service Layer (business logic lives here)
      ↓
Prisma ORM
      ↓
PostgreSQL (Neon)
```

**Rules:**
- Frontend components **never** call Prisma directly
- All business logic belongs in the Service Layer
- Route Handlers are thin — they delegate to services
- Server Actions are thin — they delegate to services
- Services are testable, reusable, and provider-agnostic

---

## Database Schema (Prisma)

### Core Models

```prisma
model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  tagline         String?
  description     String    @db.Text
  version         String?
  status          ProductStatus
  type            ProductType
  liveUrl         String?
  subdomain       String?
  repositoryUrl   String?
  documentationUrl String?
  colorAccent     String?
  featured        Boolean   @default(false)
  showOnHomepage  Boolean   @default(false)
  displayOrder    Int       @default(0)
  totalViews      Int       @default(0)
  totalClicks     Int       @default(0)
  totalVisits     Int       @default(0)
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])
  technologies    ProductTechnology[]
  gallery         ProductMedia[]
  seo             ProductSEO?
  faqs            ProductFAQ[]
  sectionsConfig  Json?     // which sections are enabled

  @@index([slug])
  @@index([categoryId])
  @@index([status])
}

model Category {
  id           String    @id @default(cuid())
  name         String
  slug         String    @unique
  description  String?   @db.Text
  bannerUrl    String?   // Cloudinary URL
  iconUrl      String?   // Cloudinary URL
  visibility   Boolean   @default(true)
  displayOrder Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  products     Product[]
  seo          CategorySEO?
}

model Technology {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  logoUrl     String?   // Cloudinary URL
  website     String?
  category    TechCategory
  createdAt   DateTime  @default(now())

  products    ProductTechnology[]
}

model Blog {
  id           String      @id @default(cuid())
  title        String
  slug         String      @unique
  excerpt      String?
  content      String      @db.Text  // Tiptap JSON or HTML
  coverUrl     String?     // Cloudinary URL
  status       BlogStatus
  category     BlogCategory
  tags         String[]
  readTime     Int?        // minutes
  publishedAt  DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  seo          BlogSEO?

  @@index([slug])
  @@index([status])
}

model ContactMessage {
  id        String         @id @default(cuid())
  name      String
  email     String
  subject   String?
  message   String         @db.Text
  status    MessageStatus  @default(UNREAD)
  ipAddress String?
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

model NewsletterSubscriber {
  id           String              @id @default(cuid())
  email        String              @unique
  status       SubscriberStatus    @default(SUBSCRIBED)
  subscribedAt DateTime            @default(now())
  unsubscribedAt DateTime?
}

model Visitor {
  id         String    @id @default(cuid())
  sessionId  String    @unique
  ipAddress  String?
  country    String?
  city       String?
  browser    String?
  os         String?
  device     String?
  source     String?
  firstSeen  DateTime  @default(now())
  lastSeen   DateTime  @updatedAt

  events     AnalyticsEvent[]
}

model AnalyticsEvent {
  id         String    @id @default(cuid())
  visitorId  String
  visitor    Visitor   @relation(fields: [visitorId], references: [id])
  event      EventType
  page       String?
  referrer   String?
  metadata   Json?
  createdAt  DateTime  @default(now())

  @@index([event])
  @@index([createdAt])
  @@index([visitorId])
}

model MediaAsset {
  id          String    @id @default(cuid())
  cloudinaryId String   @unique
  url         String
  folder      String    // e.g. "warishlabs/products/festoryx/gallery"
  altText     String?
  format      String?
  width       Int?
  height      Int?
  sizeBytes   Int?
  uploadedAt  DateTime  @default(now())
}

model HomepageSection {
  id          String    @id @default(cuid())
  type        String    // hero | featured | categories | stats | blog | etc.
  title       String?
  enabled     Boolean   @default(true)
  order       Int
  config      Json?     // section-specific config
  updatedAt   DateTime  @updatedAt
}

model NavItem {
  id          String    @id @default(cuid())
  label       String
  url         String
  position    NavPosition
  parentId    String?
  parent      NavItem?  @relation("NavChildren", fields: [parentId], references: [id])
  children    NavItem[] @relation("NavChildren")
  order       Int       @default(0)
  visible     Boolean   @default(true)
  icon        String?
  target      String?   @default("_self")
}

model SiteSetting {
  id        String    @id @default(cuid())
  key       String    @unique
  value     String    @db.Text
  type      String    @default("string") // string | json | boolean | number
  updatedAt DateTime  @updatedAt
}

model ActivityLog {
  id        String    @id @default(cuid())
  action    String
  entity    String?
  entityId  String?
  metadata  Json?
  createdAt DateTime  @default(now())
}

model FAQ {
  id           String    @id @default(cuid())
  question     String
  answer       String    @db.Text
  category     String?
  productId    String?
  displayOrder Int       @default(0)
  visible      Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

### Enums

```prisma
enum ProductStatus {
  IDEA
  PLANNING
  BUILDING
  BETA
  LIVE
  MAINTENANCE
  DEPRECATED
  ARCHIVED
}

enum ProductType {
  TOOL
  SAAS
  API
  MOBILE
  OPEN_SOURCE
  TEMPLATE
  EXPERIMENT
  WEB_APP
}

enum BlogStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

enum MessageStatus {
  UNREAD
  READ
  ARCHIVED
  SPAM
  DELETED
}

enum SubscriberStatus {
  SUBSCRIBED
  UNSUBSCRIBED
}

enum EventType {
  PAGE_VIEW
  PRODUCT_OPEN
  PRODUCT_VISIT
  CATEGORY_OPEN
  BUTTON_CLICK
  SEARCH
  NEWSLETTER_SUBSCRIBE
  CONTACT_SUBMIT
  SCROLL_25
  SCROLL_50
  SCROLL_75
  SCROLL_100
  DOWNLOAD
  COPY
  EXTERNAL_LINK
  ERROR_404
  LOGIN
  LOGOUT
}

enum NavPosition {
  HEADER
  FOOTER
}

enum TechCategory {
  FRONTEND
  BACKEND
  DATABASE
  DEVOPS
  MOBILE
  AI
  DESIGN
  TESTING
  OTHER
}

enum BlogCategory {
  DEVELOPMENT
  AI
  ENGINEERING
  CASE_STUDY
  ANNOUNCEMENT
  TUTORIAL
  BEHIND_THE_SCENES
}
```

---

## Media Architecture (Cloudinary)

### Folder Structure

All media is organized using Cloudinary's folder-based structure. Only URLs are stored in the database. No raw files are stored in the application server.

```
warishlabs/
├── products/
│   └── {product-slug}/
│       ├── logo/           # Product logo (1 file)
│       ├── banner/         # Hero banner image
│       ├── gallery/        # Multiple screenshots
│       └── og/             # Open Graph image
│
├── categories/
│   └── {category-slug}/
│       ├── banner/
│       └── icon/
│
├── blogs/
│   └── {blog-slug}/
│       ├── cover/          # Blog cover image
│       └── content/        # Images used inside blog content
│
├── labs/
│   └── {lab-slug}/
│       └── media/
│
├── open-source/
│   └── {project-slug}/
│       └── media/
│
├── site/
│   ├── logo/               # WarishLabs logo variants
│   ├── favicon/
│   ├── og/                 # Site-wide OG fallback
│   └── announcements/
│
└── misc/
    └── uploads/            # Unorganized uploads
```

### Upload Rules

- Files must be uploaded to the correct folder based on entity type and slug
- Alt text is required for all images
- Supported formats: JPG, PNG, WebP, SVG (images), PDF (documents), MP4/WebM (videos)
- Maximum file size: 10MB for images, 100MB for videos
- On entity deletion: media is archived in Cloudinary (never hard deleted) then cleaned up via scheduled job
- On slug rename: folder is renamed in Cloudinary and all database URLs updated atomically

### MediaService

```typescript
// services/MediaService.ts
interface MediaService {
  upload(file: File, folder: string, altText: string): Promise<MediaAsset>
  delete(cloudinaryId: string): Promise<void>
  replace(cloudinaryId: string, file: File): Promise<MediaAsset>
  getByFolder(folder: string): Promise<MediaAsset[]>
  buildFolder(entityType: string, slug: string, subfolder: string): string
}
```

---

## CMS Architecture

Every piece of visible content is database-driven.

### Homepage Builder

```typescript
// HomepageSection stored in DB
interface HomepageSection {
  id: string
  type: 'hero' | 'featured' | 'categories' | 'latest-products'
       | 'featured-products' | 'stats' | 'why-warishlabs'
       | 'open-source' | 'blog' | 'faq' | 'newsletter' | 'contact'
  title?: string
  enabled: boolean
  order: number
  config: Record<string, unknown>  // Section-specific config
}
```

Admin drag-to-reorders sections → database `order` updates → homepage re-renders from database on next request. No code change required.

### SEO Architecture

```typescript
// generateMetadata() in every page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const seo = await getSEOForPage(params.slug)
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: { ... },
    twitter: { ... },
    robots: seo.robots,
    alternates: { canonical: seo.canonicalUrl },
  }
}
```

Every entity (Product, Blog, Category) has a corresponding SEO model in the database.

---

## Service Layer Pattern

Each feature module owns its service:

```typescript
// features/products/services/ProductService.ts
class ProductService {
  async getAll(filters?: ProductFilters): Promise<Product[]>
  async getBySlug(slug: string): Promise<Product | null>
  async create(data: CreateProductInput): Promise<Product>
  async update(id: string, data: UpdateProductInput): Promise<Product>
  async delete(id: string): Promise<void>
  async publish(id: string): Promise<Product>
  async incrementView(id: string): Promise<void>
}

// Server Action calls service
export async function createProductAction(data: CreateProductInput) {
  const session = await requireAdmin()           // Auth check
  const validated = createProductSchema.parse(data) // Zod validation
  return ProductService.create(validated)         // Service call
  // No Prisma here
}
```

---

## Analytics Engine

### Event Tracking

```typescript
// Client-side event tracker
function trackEvent(event: EventType, metadata?: Record<string, unknown>) {
  fetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({ event, page: window.location.pathname, metadata }),
  })
}
```

### Visitor Identification

```typescript
// Middleware attaches session ID to every request
// Session ID is a secure random UUID stored in HTTP-only cookie
// No personal data stored without consent
// IP-to-geography resolution happens server-side
```

### Analytics Dashboard Queries

```typescript
// Example analytics queries
const getVisitorTrend = (days: number) => prisma.$queryRaw`
  SELECT DATE(created_at) as date, COUNT(DISTINCT session_id) as visitors
  FROM visitors
  WHERE created_at >= NOW() - INTERVAL '${days} days'
  GROUP BY date ORDER BY date
`
```

---

## Authentication Architecture

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  if (isAdminRoute) {
    const session = getSession(request)
    if (!session) return redirectToLogin(request)
  }
}

// Cookie configuration
const SESSION_COOKIE = {
  name: '__warishlabs_session',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,   // 7 days
}
```

---

## Security Checklist

| Layer | Measure |
|---|---|
| Auth | HTTP-only secure cookie sessions |
| Routes | Admin middleware on all `/admin/*` routes |
| Input | Zod validation on every Server Action and Route Handler |
| Database | Parameterized queries via Prisma (no raw SQL injection risk) |
| Rich Text | Sanitize Tiptap HTML output before rendering |
| Rate Limiting | Applied to contact form, newsletter, search, and analytics endpoints |
| CSRF | Server Actions are CSRF-protected by Next.js by default |
| Headers | Strict CSP, X-Frame-Options, X-Content-Type-Options |
| Env | All secrets in environment variables, never in code |
| Media | Cloudinary signed uploads for admin, unsigned for public |
| Logs | Activity logs for all admin actions |

---

## Performance Strategy

| Strategy | Implementation |
|---|---|
| Server Components | Default for all pages — minimal client JS |
| Client Components | Only for interactivity (forms, animations, charts) |
| Image Optimization | Next.js `<Image>` + Cloudinary transformation URLs |
| Caching | `unstable_cache` for database reads, ISR for product/blog pages |
| Code Splitting | Automatic via App Router |
| Lazy Loading | Dynamic imports for heavy components (3D, charts) |
| Fonts | `next/font` with `display: swap` |
| Animation Performance | Framer Motion `will-change` and GPU-composited transforms only |
| Bundle Size | Audit with `@next/bundle-analyzer` |

**Core Web Vitals Targets:**
- LCP < 2.5s
- FID / INP < 100ms
- CLS < 0.1
- Lighthouse Score ≥ 90 (all categories)

---

## API Design

### Public Route Handlers

```
GET  /api/search?q={query}          → Global search
POST /api/contact                   → Submit contact form
POST /api/newsletter/subscribe      → Subscribe to newsletter
POST /api/newsletter/unsubscribe    → Unsubscribe
POST /api/analytics/event           → Track analytics event
GET  /api/sitemap.xml               → Auto-generated sitemap
GET  /api/og?type={type}&slug={slug} → Dynamic OG image (future)
```

### Admin Route Handlers (Protected)

```
All admin data operations use Server Actions (not API routes)
Route Handlers only used for operations requiring direct HTTP access
```

---

## Coding Standards

### TypeScript
- `strict: true` in `tsconfig.json`
- No `any` types
- All props typed with interfaces
- All API responses typed

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | useCamelCase | `useAnalytics.ts` |
| Server Actions | verbNounAction | `createProductAction` |
| Variables | camelCase | `productSlug` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Database fields | snake_case | `product_id` |
| API routes | kebab-case | `/api/newsletter/subscribe` |
| Folders | kebab-case | `features/open-source/` |
| Zod schemas | nounSchema | `productSchema` |
| Types | PascalCase | `ProductWithCategory` |

### Component Rules
- One component per file
- Props interface above component
- No default export + named export mixing in same file
- Client components: `'use client'` directive at top
- No business logic inside components — delegate to hooks and services

---

## Git Workflow

```
main         → Production (protected, requires PR)
develop      → Development integration branch
feature/*    → New features (branched from develop)
fix/*        → Bug fixes
chore/*      → Non-functional changes (deps, config)
```

**Commit Convention:** Conventional Commits

```
feat: add product gallery section
fix: resolve slug collision on category creation
chore: update prisma to 5.x
docs: update media folder structure
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=

# Authentication
AUTH_SECRET=
AUTH_COOKIE_NAME=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=

# Email
RESEND_API_KEY=
EMAIL_FROM=
GMAIL_USER=
GMAIL_APP_PASSWORD=

# Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_CLARITY_ID=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=

# Rate Limiting (optional Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Future Scalability Map

The architecture already supports these future additions **without redesign**:

| Feature | Path |
|---|---|
| Multi-admin roles | Add `AdminRole` model, extend middleware |
| OAuth login | Add NextAuth.js provider config |
| Payments | Integrate Razorpay/Stripe per product |
| Public API | Mount route handlers under `api.warishlabs.in` |
| Customer accounts | Add `User` model, separate auth flow |
| Mobile app | Consume existing Route Handlers as REST API |
| AI features | Add AI service in `services/AIService.ts` |
| Notifications | Add `Notification` model, push via web push or email |
| Chrome Extension | Consume public Route Handlers |
| Internationalization | Next.js i18n routing layer on top of existing pages |

---

## Core Engineering Principles

1. **Single Source of Truth** — database drives all content
2. **Feature Isolation** — each feature owns its own components, hooks, services, schemas, types
3. **Service Layer** — business logic never leaks into components or route handlers
4. **Strict Typing** — TypeScript strict mode throughout
5. **Zod Everywhere** — every input validated before reaching the service layer
6. **Performance First** — server components by default, lazy load everything heavy
7. **Security by Default** — auth, rate limiting, validation, sanitization from day one
8. **Extensible Design** — new features should slot in, not require rewrites
9. **Clean Code** — small functions, meaningful names, no duplication
10. **Professional Documentation** — every module documented, every env variable explained

---

## Final Goal

The WarishLabs platform should behave like a professional software company's official website — not a static portfolio. Any developer or AI agent reading this document should be able to set up, build, and extend the platform from scratch with no ambiguity.
