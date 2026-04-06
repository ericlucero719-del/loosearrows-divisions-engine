# Loose Arrows Supply & Logistics — Divisions Engine

## Overview
Node.js/TypeScript logistics backend for Loose Arrows Supply Logistics. Features a 10-division operational engine, government contract bid pipeline, and a Division 10 Operator Bot for autonomous contract intelligence.

## Tech Stack
- **Language**: TypeScript 5.9
- **Framework**: Express.js v5
- **Registry**: In-memory (all data clears on restart — must recreate after each boot)
- **Dev Server**: ts-node-dev with hot reload on port 3000
- **Master**: port 4000 (`master.ts`)

## Project Structure
```
src/
  server.ts              - Entry point — mounts all division routers
  core/
    engine.ts            - Shared registry + operatorWorkflow middleware
modules/
  division3/             - Medical & Surgical Supply — bid/quote/submit pipeline
    division3.service.ts
    division3.controller.ts
    division3.routes.ts
  division10/            - Logistics & Fleet Intelligence + Operator Bot
    division10.service.ts
    division10.controller.ts
    division10.routes.ts
    division10.bot.types.ts    - All bot type definitions
    division10.bot.service.ts  - Bot engine (10-step loop + Architect Command Layer)
    dashboard.html             - Cyberpunk Division 10 cockpit UI
```

## Division 3 — Medical & Surgical Supply
### Routes
- `POST   /division/3/bids`                   Create bid
- `GET    /division/3/bids`                   List bids
- `GET    /division/3/bids/:id`               Get bid
- `PATCH  /division/3/bids/:id/pricing`       Update CLIN pricing (pre-award only)
- `GET    /division/3/bids/:id/submission`    Printable HTML capability statement

### IHS Gallup BPA (NOIFCGIMCBPA26003)
- 13 CLINs at 18% TARGET margin → $3,219.64 total
- POC: Felecia Chavez felecia.chavez@ihs.gov
- Deadline: April 16, 2026
- Contract field: `contractName` (NOT `title`)

### Pricing methodology
- MARGIN_BANDS: low=0.08, target=0.18, premium=0.27
- IHS CLINs: CLIN-001=$85, CLIN-002=$336.30, CLIN-003=$49.56, CLIN-004=$1858.50, CLIN-005=$33.63, CLIN-006=$106.14, CLIN-007=$68.44, CLIN-008=$80.00, CLIN-009=$12.51, CLIN-010=$182.50, CLIN-011=$51.80, CLIN-012=$18.76, CLIN-013=$336.50

## Division 10 — Operator Bot (DIV10-BOT-001)
### Identity
- Authority Level 1 — Draft + Analysis Only
- Reports to: Eric Lucero (Architect)
- Never submits, contacts, or commits to anything

### 10-Step Loop
`Discover → Classify → Extract → Analyze → Match → Draft → Alert → Recommend → Log → Await Architect`

### Fit Scale (0.0–1.0)
- ≥0.80 strong · 0.50–0.79 moderate · <0.50 weak

### Supplier Scoring (5-factor weighted)
- Reliability 40% · Response Time 20% · Category Fit 20% · Inventory Availability 10% · Past Performance 10%
- 80+ primary · 60–79 backup · <60 not-recommended

### Alert Types (12)
`new-opportunity · deadline-72h/48h/24h · amendment · supplier-issue · missing-info · high-variance-price · compliance-risk · fit-warning · escalation · system`

Alert severity: High | Medium | Low

### Opportunity Statuses
`DISCOVERY → CLASSIFIED → EXTRACTED → ANALYSIS → SUPPLIER_MATCHED → DRAFT_PREP → READY_FOR_ARCHITECT → ESCALATED → HOLD | REVISING | DECLINED | CLOSED`

### Relic Types
`discovery · analysis · match · prep · alert · update · risk · recommendation`

### Architect Command Layer
**5 commands only** (ambiguous language is rejected):
- `Proceed`   → DRAFT_PREP. Draft built. No submission.
- `Hold`      → HOLD. All actions paused. Open alerts acknowledged.
- `Decline`   → DECLINED. Archived. All further commands blocked.
- `Revise`    → Re-runs steps 4–8. Final status captured after stepEscalate.
- `More info` → Full re-run + risk relics per uncertainty category.

### Uncertainty Categories (6)
`compliance · supplier-fit · pricing-variance · delivery-feasibility · missing-data · ambiguous-requirements`

### Bot Routes
```
GET  /division/10/bot/status
POST /division/10/bot/run
GET  /division/10/bot/cycles

GET  /division/10/bot/opportunities          ?status=
POST /division/10/bot/opportunities
GET  /division/10/bot/opportunities/:id
POST /division/10/bot/opportunities/:id/analyze
POST /division/10/bot/opportunities/:id/match
POST /division/10/bot/opportunities/:id/draft
GET  /division/10/bot/opportunities/:id/escalation
POST /division/10/bot/opportunities/:id/architect-command

GET  /division/10/bot/relics                 ?type= ?oppId= ?limit=
GET  /division/10/bot/alerts                 ?severity= ?unacknowledged=true
POST /division/10/bot/alerts/:id/acknowledge

GET  /division/10/bot/reports/daily
GET  /division/10/bot/reports/weekly

GET  /division/10/bot/architect/authority
GET  /division/10/bot/architect/commands     ?oppId=
```

## Important Notes
- **TypeScript**: use `arr[arr.length-1]` not `arr.at(-1)` — tsconfig targets below ES2022
- **Registry is in-memory** — all data clears on restart
- **Contract creation field**: `contractName` (NOT `title`) — uses `POST /division/2/contracts`
- **stepAlert() skips** HOLD, DECLINED, and CLOSED opportunities
- **runCycle() only processes** DISCOVERY, CLASSIFIED, EXTRACTED statuses
- **Revise/More info** capture final `opp.status` after `stepEscalate` runs

## Dashboards
| Dashboard | URL |
|-----------|-----|
| Division 10 Cockpit | `/division/10/dashboard` |
| Vendor Cockpit | `/vendor/dashboard` |
| Operator Control Room | `/operator/dashboard` |
| Index | `/dashboards` |

## Development
```bash
npm run dev     # ts-node-dev hot reload on port 3000
```
