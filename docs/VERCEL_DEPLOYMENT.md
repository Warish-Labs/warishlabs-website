# Vercel Deployment Guide — WarishLabs Website

This guide provides step-by-step instructions on deploying the full-stack `warishlabs-website` catalog to Vercel production servers, utilizing Neon PostgreSQL, Clerk SSO, Cloudinary media storage, Resend transaction mail, and Upstash Redis rate limiters.

---

## 1. Prerequisites & Provisioning Services

Ensure you have the credentials for the following services ready before starting:

### A. PostgreSQL Database (Neon)
1. Sign up on **Neon** (`neon.tech`) and create a new project.
2. In the dashboard, copy the connection string.
3. Switch connection mode to **Pooled** (uses transaction port `54321` or query pooler endpoints) for `DATABASE_URL`.
4. Switch connection mode to **Direct** (port `5432`) for `DIRECT_URL` (necessary to execute database migration commands).

### B. Clerk Authentication (Production Instance)
1. Sign up on **Clerk** (`clerk.com`) and create a new application instance.
2. Under API Keys, copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. In Clerk Dashboard → Paths, set the Sign-in URL to `/admin/login` and Sign-up URL to `/admin/login`.
4. Add your production domain (`https://warishlabs.in`) to the Allowed Origins.

### C. Cloudinary Asset Storage
1. Sign up on **Cloudinary** (`cloudinary.com`) and retrieve your Cloud Name, API Key, and API Secret.
2. Under Media Library, create folders:
   - `warishlabs/products`
   - `warishlabs/labs`
   - `warishlabs/general`

### D. Resend Transactional Mail
1. Sign up on **Resend** (`resend.com`) and create an API Key.
2. **Domain Verification**: Add your domain (`warishlabs.in`) in Resend to authorize production email routing from `noreply@warishlabs.com`. (Without this verification, Resend will only permit deliveries to your registered developer account email).

### E. Distributed Caching & Rate-Limiting (Upstash Redis)
1. Create a serverless Redis database on **Upstash** (`upstash.com`).
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the database settings.

---

## 2. Vercel Project Import & Build Settings

1. Log in to Vercel and click **Add New** → **Project**.
2. Import the `warishlabs-website` git repository.
3. Set the **Framework Preset** to **Next.js**.
4. Keep the root directory unchanged.
5. Override the **Build Command** to:
   ```bash
   npx prisma generate && next build
   ```

---

## 3. Environment Variables Configuration

In the Vercel project settings (Settings → Environment Variables), add the following variables:

| Variable Name | Environment | Description / Placeholder |
|---|---|---|
| `DATABASE_URL` | All | Neon pooled connection string |
| `DIRECT_URL` | All | Neon direct connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | All | Clerk production publishable key |
| `CLERK_SECRET_KEY` | All | Clerk production secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | All | `/admin/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | All | `/admin/login` |
| `ADMIN_EMAIL` | All | `warishlabs@gmail.com` (Owner SSO account) |
| `NEXT_PUBLIC_APP_URL` | All | `https://warishlabs.in` |
| `CLOUDINARY_CLOUD_NAME` | All | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | All | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | All | Cloudinary API secret |
| `RESEND_API_KEY` | Production | Resend sending API key |
| `UPSTASH_REDIS_REST_URL` | All | Upstash REST endpoint URL |
| `UPSTASH_REDIS_REST_TOKEN` | All | Upstash REST authorization token |

---

## 4. Run First-Time Database Setup

Since you are provisioning a fresh PostgreSQL database, you must push the Prisma schemas and execute the seed scripts:

1. **Push schema**: From your local terminal (configured with the production `DATABASE_URL` / `DIRECT_URL` variables in a temporary `.env.local`), execute:
   ```bash
   npx prisma db push
   ```
2. **Seed databases**: Populates initial categories, layout sections (hero, about, contact) and settings:
   ```bash
   npx -y tsx prisma/seed.ts
   ```

---

## 5. Domain Records Configuration

To link your purchased domain name `warishlabs.in` in Vercel:

1. Under Project Settings → **Domains**, add `warishlabs.in` and `www.warishlabs.in`.
2. Configure your Domain Registrar's DNS zone files:
   - **A Record** (for `warishlabs.in` root): Point to Vercel IP `76.76.21.21`.
   - **CNAME Record** (for `www` subdomain): Alias to `cname.vercel-dns.com`.
3. Vercel will automatically provision TLS/SSL certificates once DNS propagation finishes.

---

## 6. Post-Deploy Checklist

- [ ] Homepage renders successfully (3D WebGL WebGL starfields load on desktop).
- [ ] Navigating to `/admin/dashboard` correctly redirects you to the Clerk Login page.
- [ ] Logging in as `warishlabs@gmail.com` permits dashboard console access.
- [ ] Creating, editing, and deleting a Product works and synchronizes with Cloudinary assets.
- [ ] Submitting the contact form returns a success toast and fires a Resend API request.
- [ ] Navigating to `/sitemap.xml` and `/robots.txt` outputs valid indexes.
- [ ] Upstash Redis logs verify successful connection and sliding window rate refills.
