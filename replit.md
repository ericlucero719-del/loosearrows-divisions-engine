# Loose Arrows Supply & Logistics — Divisions Engine v2.0

## Overview
Production-grade Node.js/TypeScript logistics and government procurement backend for Loose Arrows Supply & Logistics. Features an 11-division operational engine, full pre→post award pipeline (SAM.gov → contract → bid → PO → shipment → invoice → payment), tiered API key access control, DIV10-BOT-001 autonomous contract intelligence, multi-platform commerce automation (Shopify/Amazon/Instagram/YouTube/TikTok), transaction fee billing engine, vendor portal, PDF document generation, and a Command Center dashboard.

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
    onboarding.html           - Client onboarding page (8-step pipeline + training guide)
    vendor-dashboard.html     - Vendor cockpit dashboard
    operator-dashboard.html   - Operator control room dashboard
    dashboards.routes.ts      - Routes for all HTML pages
  division2/                  - Contract Alignment (PostgreSQL)
  division3/                  - Requests/Bids/Pipeline (PostgreSQL)
  division4/                  - Purchase Orders & Inventory (PostgreSQL)
  division5/                  - Shipments & Fulfillment (PostgreSQL)
  division7/                  - Vendor & Partner Management (PostgreSQL)
  division9/                  - Invoices & Financials (PostgreSQL)
  division10/                 - Intelligence & System View + Bot
prisma/
  schema.prisma               - GovVendor, GovContract, GovContractProduct, GovBid, GovBidLineItem, GovWorkRequest, GovPO, GovPOLineItem, GovShipment, GovInvoice, GovInvoiceLineItem, ApiKey
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

## Pre-Award Bid Pipeline (Divisions 2, 3, 7)
1. `POST /division/2/contracts` — register contract
2. `POST /division/2/contracts/:id/products` — add CLINs
3. `POST /division/7/vendors` — register vendor
4. `POST /division/3/bids` — create bid (links contract + vendor)
5. `PATCH /division/3/bids/:id/pricing` — adjust pricing
6. `POST /division/3/bids/:id/quote` — generate quote ref
7. `POST /division/3/bids/:id/submit` — DRAFT → SUBMITTED
8. `GET /division/3/bids/:id/submission` — printable capability statement

## Post-Award Pipeline (Divisions 4, 5, 9)
9. `PATCH /division/3/bids/:id/status` `{status:"AWARDED"}` — mark bid awarded
10. `POST /division/4/purchase-orders/from-bid/:bidId` — auto-create PO from bid
11. `PATCH /division/4/purchase-orders/:poId/status` — advance PO (DRAFT→SENT→ACKNOWLEDGED→FULFILLED)
12. `POST /division/5/shipments/from-po/:poId` — auto-create shipment from PO
13. `PATCH /division/5/shipments/:id/tracking` — update carrier + tracking number
14. `PATCH /division/5/shipments/:id/status` — advance status (PENDING→IN_TRANSIT→DELIVERED)
15. `POST /division/9/invoices/from-bid/:bidId` — auto-create invoice from bid (with dueDate)
16. `PATCH /division/9/invoices/:id/status` `{status:"SENT"}` — send invoice to agency
17. `POST /division/9/invoices/:id/payment` `{amount:...}` — record payment (auto-marks PAID)
18. `GET /division/9/summary` — financial summary (billed, collected, outstanding)
- Manual creates: `POST /division/4/purchase-orders`, `POST /division/5/shipments`, `POST /division/9/invoices`
- Inventory by SKU: `GET /division/4/inventory`
- Overdue shipments: `GET /division/5/shipments/overdue`

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

## PDF Document Generation
| Endpoint | Output |
|---|---|
| `GET /api/pdf/invoice/:invoiceId` | Branded invoice PDF (Loose Arrows letterhead) |
| `GET /api/pdf/po/:poId` | Purchase order PDF |
| `GET /api/pdf/bid/:bidId` | Capability statement PDF |

Powered by `pdfkit`. All require OPERATOR+ key. Files download automatically.

## Rate Limiting
| Tier | Limit (per 15 min) |
|---|---|
| PUBLIC (no key) | 60 requests |
| OBSERVER | 200 requests |
| OPERATOR | 1,000 requests |
| ARCHITECT | 5,000 requests |

Public limiter applied at server level. Tier-aware limiter applied inside `/api` after key validation. Keys bucketed by `apiKeyId`; unauthenticated by IP.

## Development
```bash
npm run dev     # ts-node-dev hot reload on port 5000
```
