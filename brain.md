# brain.md — WarishLabs Website

> **Last Updated:** 2026-06-29
> **Status:** Production-Ready (Compiled, Security-Hardened, Monitored & Tested)

---

## 1. System Overview

WarishLabs is a modern, CMS-driven software laboratory profile presenting SaaS tools, open source contributions, and visual canvas sandboxes.

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
