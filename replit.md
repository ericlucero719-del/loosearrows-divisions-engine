# Loose Arrows Supply & Logistics — Divisions Engine v2.0

## Overview
Production-grade Node.js/TypeScript logistics and government procurement backend for Loose Arrows Supply & Logistics. Features a 10-division operational engine, government contract bid pipeline (bid → quote → submit), tiered API key access control, DIV10-BOT-001 autonomous contract intelligence, and customer-facing public pages.

## Tech Stack
- **Language**: TypeScript 5.9
- **Framework**: Express.js v5
- **Database**: PostgreSQL via Prisma ORM (persistent — survives restarts)
- **Dev Server**: ts-node-dev with hot reload on port 5000

## Project Structure
```
src/
  server.ts                   - Entry point — mounts all division routers
  middleware/
    apiKey.ts                 - API key auth middleware (tier enforcement)
  routes/
    admin.ts                  - Admin key management (issue/revoke/audit)
  core/
    engine.ts                 - Shared registry + operatorWorkflow middleware
modules/
  dashboards/
    demo.html                 - Public marketing/demo page
    pricing.html              - Public pricing & access request page
    guide.html                - Public user guide (12 sections)
    legal.html                - Public legal/compliance (10 sections)
    vendor-dashboard.html     - Vendor cockpit dashboard
    operator-dashboard.html   - Operator control room dashboard
    dashboards.routes.ts      - Routes for all HTML pages
  division2/                  - Contract Alignment (PostgreSQL)
  division3/                  - Requests/Bids/Pipeline (PostgreSQL)
  division7/                  - Vendor & Partner Management (PostgreSQL)
  division10/                 - Intelligence & System View + Bot
prisma/
  schema.prisma               - GovVendor, GovContract, GovContractProduct, GovBid, GovBidLineItem, GovWorkRequest, ApiKey
```

## API Key Security System
- **Middleware**: `src/middleware/apiKey.ts` gates all `/division/*` routes
- **Tiers**: OBSERVER (read-only), OPERATOR (Div 1-9 full), ARCHITECT (everything + bot)
- **Admin routes**: `POST /admin/keys`, `GET /admin/keys`, `PATCH /admin/keys/:id/toggle`, `DELETE /admin/keys/:id`, `GET /admin/keys/audit`
- **Admin auth**: `X-Admin-Secret` header required for all admin endpoints
- **Key format**: `la-obs-*`, `la-opr-*`, `la-arc-*`
- **Initial Architect key**: `la-arc-305a0c0d1b96600275d95978e66d2d47d9bb`
- **Copilot Operator key**: `la-opr-d713a007a3a47494ed56c667313b261aeaf8`
- **ADMIN_SECRET**: stored in Replit Secrets

## Public Routes (no key required)
`/`, `/demo`, `/pricing`, `/guide`, `/legal`, `/api`, `/vendor/dashboard`, `/operator/dashboard`, `/division/10/system/health`, static assets

## ARCHITECT-only routes
`/division/10/bot/*`, `/division/10/system/architect/*`

## Pricing Plans
- **OBSERVER**: $99/mo — read-only access
- **OPERATOR**: $399/mo — full Division 1-9 pipeline
- **ARCHITECT**: Custom/Enterprise — full system + bot
- Access request form on `/pricing` sends email to `access@loosearrows.com`

## Bid Pipeline (Division 3)
1. `POST /division/2/contracts` — register contract
2. `POST /division/2/contracts/:id/products` — add CLINs
3. `POST /division/7/vendors` — register vendor
4. `POST /division/3/bids` — create bid (links contract + vendor)
5. `PATCH /division/3/bids/:id/pricing` — adjust pricing
6. `POST /division/3/bids/:id/quote` — generate quote ref
7. `POST /division/3/bids/:id/submit` — DRAFT → SUBMITTED
8. `GET /division/3/bids/:id/submission` — printable capability statement

## Division 10 Bot (DIV10-BOT-001)
- **Authority**: Level 1 — Draft + Analysis Only
- **Reports to**: Eric Lucero (Architect)
- **10-Step Loop**: Discover → Classify → Extract → Analyze → Match → Draft → Alert → Recommend → Log → Await Architect
- **Architect Commands**: Proceed, Hold, Decline, Revise, More info

## IHS Gallup BPA (in DB)
- Ref: NOIFCGIMCBPA26003 | 13 CLINs | $3,219.64 total | SUBMITTED

## Important TypeScript Notes
- Use `arr[arr.length-1]` not `arr.at(-1)` — tsconfig targets below ES2022
- `getSystemHealth()` and `getFullReport()` are now async — always await them
- API key middleware uses `req.originalUrl.split('?')[0]` not `req.path`

## Dashboards
| URL | Description |
|-----|-------------|
| `/demo` | Public marketing page |
| `/pricing` | Plans + access request form |
| `/guide` | Self-help user guide |
| `/legal` | Legal & compliance |
| `/vendor/dashboard` | Vendor cockpit |
| `/operator/dashboard` | Operator control room |
| `/division/10/dashboard` | Division 10 intelligence cockpit |

## Development
```bash
npm run dev     # ts-node-dev hot reload on port 5000
```
