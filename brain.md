# brain.md — WarishLabs Website

> **Last Updated:** 2026-06-29
> **Status:** Production-Ready (Compiled, Security-Hardened & Tested)

---

## 1. System Overview

WarishLabs is a modern, CMS-driven software laboratory profile presenting SaaS tools, open source contributions, and visual canvas sandboxes.

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Prisma ORM, PostgreSQL (Neon), Clerk SSO, Cloudinary, Resend transactional mail, Upstash Redis.
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

## 3. Rate-Limiting & Security Parameters

- **Sliding-Window Rate Limiter:** Built on Upstash Redis REST client (`@upstash/ratelimit`) matching endpoint keys:
  - `/api/contact`: Max 5 requests per hour.
  - `/api/newsletter/subscribe`: Max 5 requests per hour.
  - `/api/search`: Max 30 requests per minute.
  - `/api/analytics/event`: Max 60 requests per minute.
  - `/api/admin/*`: Protected with strict administrative rate limits (Max 60 requests per minute).
- **Local Fallback:** Falls back automatically to local in-memory token bucket rate limiters in development (or if Upstash variables are absent) to keep serverless functions working.
- **Security Headers & CSP:** Sets frames denial (`X-Frame-Options: DENY`), mime sniffing guards (`X-Content-Type-Options: nosniff`), Referrer Policy, and strict Content-Security-Policy (CSP) headers including Clerk's SSO proxies and Google Tag Manager.
- **XSS Sanitization:** All dynamic description and content injections are sanitized with `isomorphic-dompurify` prior to dangerouslySetInnerHTML rendering.

---

## 4. Media & Cloudinary Sync Pipeline

- **Media Service:** Image and video uploads are routed folder-wise to `warishlabs/products` and `warishlabs/labs` subdirectories.
- **Cloud Asset Registry Sync:** Accessible from `/admin/media`, the synchronization utility fetches all remote Cloudinary assets directly, imports missing ones into the local database, and prunes stale references that no longer exist on the cloud.
- **Cleanup Sync:** Prior to deleting a Product DB record, URL parsing extracts the Cloudinary `publicId` paths via regex-URL parser, executes `cloudinary.uploader.destroy()`, and then removes the SQL records.

---

## 5. Communications & Campaign Composer

- **Message Inbound Reply Tool:** Inbound queries from visitors can be responded to directly from `/admin/messages`. Custom responses dispatch HTML formatted emails with original messages embedded through Resend.
- **Newsletter Broadcast Campaigns:** Composes rich custom HTML campaigns in the newsletter dashboard and broadcasts them to all active opt-in audiences using Resend's high-speed batch mailing endpoint.
- **Audience Export:** Generates downloadable client-side CSV files containing subscriber registries (emails, active states, sign up dates).

---

## 6. Verification Commands & Testing

- **Compilation check:** `npx tsc --noEmit` compiles cleanly.
- **Build check:** `npm run build` generates production assets successfully.
- **Vitest specs:** `npm run test:run` runs unit tests for slugification, dates formatting, mocked email dispatchers, and mocked canvas render suites. All 13 test suites execute and pass cleanly.
