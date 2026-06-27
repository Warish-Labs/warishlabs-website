# Deployment Guide — WarishLabs

This guide documents the procedures for deploying the WarishLabs platform to production environments.

---

## Environment Variables Checklist

Ensure the following variables are configured in your hosting platform (e.g. Vercel, Firebase App Hosting, or GCP Cloud Run):

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `ADMIN_EMAIL` | Super admin user identity email | `warishlabs@gmail.com` |
| `CRON_SECRET` | Header validation token for analytics pruner cron | Generate secure hex (e.g. `openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | Fully qualified base domain url | `https://warishlabs.in` or `https://warishlabs.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Media library cloud identifier | Get from Cloudinary console |
| `CLOUDINARY_API_KEY` | Media library API credentials key | Get from Cloudinary console |
| `CLOUDINARY_API_SECRET` | Media library API credentials secret | Get from Cloudinary console |
| `RESEND_API_KEY` | Transactional email provider token | Get from Resend console |
| `UPSTASH_REDIS_REST_URL`| Distributed sliding window rate limiter url | Get from Upstash console |
| `UPSTASH_REDIS_REST_TOKEN`| Distributed sliding window rate limiter token | Get from Upstash console |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk user authentication publishable key | Get from Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk user authentication secret key | Get from Clerk Dashboard |

---

## Database Provisioning & Migrations

To apply schema alterations directly to the production datastore during builds or post-deploy stages:

### 1. Generate Client Types
```bash
npx prisma generate
```

### 2. Apply Production Schema
Since connection URLs are managed via `prisma.config.ts` loading environment variables dynamically, run schema migrations to update tables, indices, and relationships:
```bash
npx prisma db push
```

### 3. Run Production Seeds
If initializing the site layout, default homepage sections, categories, and technologies:
```bash
npx tsx prisma/seed.ts
```

---

## Cron Analytics Pruning

Configure a scheduled server cron job (e.g. Vercel Cron, GCP Cloud Scheduler, or Cron-job.org) targeting the pruner API endpoint:

- **Target Route**: `/api/analytics/cleanup`
- **Method**: `POST`
- **Schedule**: `0 0 * * *` (Daily at midnight)
- **Headers**:
  - `Authorization`: `Bearer <YOUR_CRON_SECRET>`

This cron deletes local event analytics records older than 90 days, keeping the datastore size low and query times optimal.
