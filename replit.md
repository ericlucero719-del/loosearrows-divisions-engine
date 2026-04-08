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
`/`, `/demo`, `/pricing`, `/guide`, `/legal`, `/join`, `/join/success`, `/api`, `/vendor/dashboard`, `/operator/dashboard`, `/division/10/system/health`, `/api/stripe/plans`, `/api/stripe/publishable-key`, `/api/stripe/subscribe`, `/api/resellers/signup`, `/api/shopify/webhook`, static assets

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

## Dashboards & Public Pages
| URL | Description |
|-----|-------------|
| `/demo` | Public marketing page |
| `/pricing` | Plans + access request form |
| `/guide` | Self-help user guide |
| `/legal` | Legal & compliance |
| `/join` | Public reseller signup page (no key) — auto-issues API key |
| `/join/success` | Post-Stripe-checkout success page |
| `/vendor/dashboard` | Vendor cockpit |
| `/operator/dashboard` | Operator control room |
| `/command-center` | Operator Command Center |
| `/vendor-portal` | Vendor portal HTML dashboard |
| `/division/10/dashboard` | Division 10 intelligence cockpit |

## Shopify Connector (T001)
- `GET  /api/shopify/store` — Shopify store info
- `POST /api/shopify/sync` — sync recent Shopify orders (?limit=50)
- `POST /api/shopify/sync/:id` — sync single order by Shopify ID
- `GET  /api/shopify/orders` — list synced orders
- `GET  /api/shopify/orders/:id` — single order detail
- `GET  /api/shopify/summary` — revenue/profit/status breakdown
- `POST /api/shopify/webhook` (PUBLIC, HMAC-verified) — receive Shopify order webhooks
- Requires: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_APP_SHARED_SECRET`

## SAM.gov Integration (T003)
- `GET  /api/sam/search` — search live federal opportunities (?keyword=&naics=&limit=)
- `GET  /api/sam/match` — auto-match against Division 8 NAICS codes
- `GET  /api/sam/watchlist` — list saved opportunities (?status=)
- `GET  /api/sam/watchlist/summary` — totals, award values, status breakdown
- `POST /api/sam/watchlist` — add opportunity { noticeId, status?, notes? }
- `PATCH /api/sam/watchlist/:noticeId` — update status/notes
- `DELETE /api/sam/watchlist/:noticeId` — remove from watchlist
- Requires: `SAM_GOV_API_KEY` env var

## Billing & Transaction Fee Engine (T004)
- `GET  /api/billing/estimate?amount=X&platform=Y` — fee calculation for a given contract value
- `GET  /api/billing/revenue` — fee revenue across all commerce orders by platform
- `GET  /api/billing/config` — list all platform billing configs
- `GET  /api/billing/config/:platform` — get config for a platform
- `POST /api/billing/config/:platform` — update fee rate + limits
- Default: 0.75% platform fee, $25 minimum

## Stripe Integration
- Stripe Sandbox connected via Replit native integration
- `GET  /api/stripe/publishable-key` (PUBLIC) — Stripe.js frontend key
- `GET  /api/stripe/plans` (PUBLIC) — reseller subscription plans (STANDARD/PRO/ELITE)
- `POST /api/stripe/subscribe` (PUBLIC) — create Checkout session { email, priceId, resellerId }
- `POST /api/stripe/portal` (key-gated) — customer billing portal link
- `GET  /api/stripe/status/:resellerId` (key-gated) — reseller subscription status
- `POST /api/stripe/fee/charge` (key-gated) — collect platform fee payment intent
- `GET  /api/stripe/revenue` (key-gated) — platform-wide Stripe revenue summary
- `GET  /api/stripe/payments` (key-gated) — recent successful payments
- `POST /api/stripe/webhook` — managed Stripe webhook (registered at startup)
- Reseller plans: STANDARD $49/mo, PROFESSIONAL $149/mo, ELITE $499/mo
- Products: `prod_UIf0NDdD4aNTHm`, `prod_UIf0QS6UhbdI8T`, `prod_UIf0pelt5YeK17`
- Seed script: `npx tsx scripts/seed-stripe-products.ts` (idempotent)

## Public Reseller Signup (T005)
- `POST /api/resellers/signup` (PUBLIC) — { name, email, platform?, businessName?, referralCode? }
- Returns: resellerId, resellerRef, apiKey (shown once), tier, feeRate
- API key auto-registered in ApiKey table as OPERATOR tier

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
