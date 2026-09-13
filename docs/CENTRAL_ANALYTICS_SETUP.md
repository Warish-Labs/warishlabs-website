# WarishLabs Centralized Visitor Analytics — Setup & Integration Guide

This guide explains how WarishLabs' multi-tenant visitor analytics service works, how to integrate any ecosystem project (e.g. Toolkit, ForgeFlow, or new apps) using Antigravity, and what steps you need to take manually.

---

## 1. Technical Architecture Overview

- **Central Ingest Endpoint**: `https://warishlabs.in/api/analytics/event`
- **Database**: Shared Neon PostgreSQL instance managed by `warishlabs-website`.
- **CORS Support**: `https://warishlabs.in/api/analytics/event` automatically allows cross-origin `POST` and preflight `OPTIONS` requests from subdomains (e.g., `toolkit.warishlabs.in`).
- **Fail-Safe Policy**: Tracking calls in client applications MUST fail silently (`.catch(() => null)`). Under no circumstances should a tracking issue affect app loading or user experience.

---

## 2. Ingest API Payload Specification

When an ecosystem project sends a tracking hit, it issues an HTTP `POST` request to `https://warishlabs.in/api/analytics/event` with the following JSON body:

```json
{
  "projectSlug": "toolkit",
  "projectId": "toolkit",
  "eventName": "page_view",
  "url": "https://toolkit.warishlabs.in/tools/json-formatter",
  "path": "/tools/json-formatter",
  "referrer": null,
  "visitorId": "v_abc123_1726200000000"
}
```

> **Key Payload Requirements**:
> - Pass **both** `projectSlug` and `projectId` set to your project's slug (e.g. `toolkit`, `forgeflow`).
> - `eventName`: Set to `"page_view"`.
> - `referrer`: Send `null` if `document.referrer` is empty (do not send empty string `""`).
> - `visitorId`: First-party persistent token stored in browser `localStorage`.

---

## 3. What Antigravity Does Automatically in Code

When you copy the **Setup Prompt** from `https://warishlabs.in/admin/analytics` and paste it into Antigravity inside your new project's repository, Antigravity will automatically:

1. **Inspect Your Project**: Detect Next.js (App Router / Pages), Vite, React, or Vanilla JS.
2. **Add Environment Variables**: Update `.env.example` and local `.env` with:
   ```env
   NEXT_PUBLIC_ANALYTICS_API_URL="https://warishlabs.in/api/analytics/event"
   NEXT_PUBLIC_ANALYTICS_PROJECT_ID="<THIS_PROJECT_SLUG>"
   ```
3. **Create Client Tracker Module** (`src/lib/analytics.ts`):
   - Manages first-party `visitorId` token in `localStorage`.
   - Dispatches fail-safe `POST` requests to the ingest API.
4. **Mount Global Route Listener**: Adds an `<AnalyticsTracker />` component or router hook into `app/layout.tsx` or `_app.tsx` to record initial hits and client-side page transitions.
5. **Verify Build**: Runs `npm run typecheck` and `npm run build` to ensure clean compilation.

---

## 4. What You (The User) Must Do Manually

1. **Register Project in WarishLabs Admin**:
   - Go to `https://warishlabs.in/admin/analytics`.
   - Click **+ Add Project**.
   - Enter **Project Name** (e.g., `ForgeFlow`), **Slug** (e.g., `forgeflow`), and **Domain** (e.g., `forgeflow.warishlabs.in`).
   - *(Note: Hits will still auto-register if you skip this, but registering gives it a clean label in the dropdown selector).*

2. **Add Vercel Environment Variables**:
   - Go to your project settings on [Vercel Dashboard](https://vercel.com).
   - Go to **Settings -> Environment Variables**.
   - Add:
     - `NEXT_PUBLIC_ANALYTICS_API_URL` = `https://warishlabs.in/api/analytics/event`
     - `NEXT_PUBLIC_ANALYTICS_PROJECT_ID` = `<your-project-slug>`
   - Enable for **Production**, **Preview**, and **Development**.

3. **Redeploy Project on Vercel**:
   - Push to `main` or click **Redeploy** on Vercel to activate the new environment variables in production.
