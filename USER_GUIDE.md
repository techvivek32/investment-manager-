# Investment & Business Listing Platform — User Guide

## Overview

A secure platform where Business Owners list businesses, Admins approve and control visibility, and Investors can view and invest only in assigned businesses. Includes notifications, analytics, audit logs, document verification, multi‑stage approval, agreements, chat, announcements, watchlist, two‑step investment, and performance metrics.

## Quick Start

- Prerequisites: Node.js 18+, local MongoDB or Atlas
- Environment: create `.env.local` in project root

```
MONGODB_URI=mongodb://127.0.0.1:27017/investment_platform
NEXTAUTH_SECRET=local-dev-secret-change-me-please-32chars-min
NEXTAUTH_URL=http://localhost:3000
UPLOAD_DIR=./public/uploads
NEXT_PUBLIC_APP_NAME=Investment Platform
NEXT_PUBLIC_MAP_PROVIDER=leaflet
```

- Install: `npm install`
- Start DB: `mkdir -p ~/data/db && mongod --dbpath ~/data/db`
- Seed demo data: `npm run seed`
- Run app: `npm run dev` → open `http://localhost:3000`

## Accounts

- Admin: `admin@example.com` / `password123`
- Owner: `owner@example.com` / `password123`
- Investor: `investor@example.com` / `password123`

## Role Workflows

### Admin
- Login and visit `/admin/dashboard`
- Users: create/update/delete (`/admin/users`)
- Businesses: review and change status (`/admin/businesses` and business detail)
- Visibility: assign investor ↔ business (`/admin/visibility`)
- Analytics: totals, most invested, top investors, monthly, status counts (`GET /api/admin/analytics`)
- Documents: verify/unverify (`PATCH /api/admin/documents/{id}/verify`)
- Notifications: see in‑app via API (`GET /api/notifications`)

Statuses available: `pending → under_review → verified → approved` or `rejected`.

### Business Owner
- Create/edit businesses: `/owner/businesses/new`, `/owner/businesses/{id}/edit`
- Upload documents: business detail page → documents section
- Announcements: post updates (`POST /api/announcements`)
- Analytics: investments per business, earnings, daily trends (`GET /api/owner/analytics`)
- Performance metrics: set `monthlyRevenue`, `profitMargin`, `growthPercentage`, `customerCount` via PATCH

### Investor
- Browse assigned approved businesses: `/investor/businesses`
- Search & filter: query params `q`, `category`, `status`, `min`, `max`
- Business detail: docs, map, invest, agreement
- Two‑step invest: enter amount → confirm → invest
- Watchlist: toggle from business page (adds/removes via `/api/watchlist`)
- Chat: ask questions to owner at `/investor/businesses/{id}/chat`
- Notifications: inbox via `/api/notifications`

## Key Features

- Notifications: owner notified on approval/rejection; investor notified on assignment; owner/admin notified on investments
- Analytics: admin and owner endpoints for dashboards
- Search/Filter: investor/admin business filtering APIs
- Audit Logs: events tracked for status updates, assignments, uploads, investments
- Document Verification: admin can mark documents verified/unverified
- Multi‑Stage Approval: realistic workflow statuses
- Agreement: HTML agreement generated per investment
- Chat: owner ↔ investor messaging (visibility controlled)
- Announcements: owner updates broadcast to assigned investors
- Watchlist: investor bookmarks assigned businesses
- Two‑Step Investment: safer confirmation flow
- Performance Metrics: richer business profile data

## Navigation Cheat‑Sheet

- Login: `/login`
- Dashboard redirect: `/dashboard`
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/businesses`, `/admin/visibility`
- Owner: `/owner/dashboard`, `/owner/businesses/new`, `/owner/businesses/{id}`
- Investor: `/investor/dashboard`, `/investor/businesses`, `/investor/businesses/{id}`

## API Cheat‑Sheet

- Auth: standard NextAuth endpoints
- Users (Admin): `GET/POST /api/admin/users`, `PATCH/DELETE /api/admin/users/{id}`
- Businesses: `GET/POST /api/businesses`, `GET/PATCH /api/businesses/{id}`
- Status (Admin): `PATCH /api/admin/businesses/{id}/status`
- Visibility (Admin): `GET/POST /api/admin/visibility`
- Investor list: `GET /api/investor/businesses?q=&category=&status=&min=&max=`
- Documents: `GET/POST /api/businesses/{id}/documents`, verify: `PATCH /api/admin/documents/{id}/verify`
- Investments: `GET/POST /api/investments`, agreement: `GET /api/investments/{id}/agreement`
- Notifications: `GET/PATCH /api/notifications`
- Messages: `GET/POST /api/messages?businessId=...`
- Announcements: `GET/POST /api/announcements`
- Watchlist (Investor): `GET/POST/DELETE /api/watchlist`
- Analytics: `GET /api/admin/analytics`, `GET /api/owner/analytics`

## Troubleshooting

- Hydration warnings: disable extensions that inject HTML; root layout suppresses warnings
- NextAuth client fetch error: ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set; avoid overriding `/api/auth/session`
- Mongo connection: verify `MONGODB_URI` and that `mongod` is running locally
- Seed data: run `npm run seed` after starting MongoDB

## Security Notes

- Passwords hashed (bcrypt)
- Role checks in all sensitive endpoints
- Row‑level constraints in queries (owner/investor isolation)
- Admin‑only actions gated at API level

## Production

- Use Atlas for `MONGODB_URI`
- Generate a strong `NEXTAUTH_SECRET`
- Set `NEXTAUTH_URL` to your production URL
- Consider email notifications and real‑time updates for production

## Support

- Verify environment variables
- Check server logs and browser console
- Inspect MongoDB collections with Compass

