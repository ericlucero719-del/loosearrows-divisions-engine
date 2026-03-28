# Loose Arrows Divisions Engine

## Overview
A Node.js/TypeScript REST API for logistics and supply chain management across multiple business divisions for Loose Arrows Supply Logistics.

## Tech Stack
- **Language**: TypeScript
- **Framework**: Express.js v5
- **Database**: PostgreSQL (Replit managed) via Prisma ORM
- **Validation**: Zod
- **Dev Server**: ts-node-dev with hot reload
- **Build**: TypeScript compiler (tsc) outputting to `dist/`

## Project Structure
```
src/
  server.ts              - Entry point, Express app + route mounting
  prisma.ts              - Prisma client singleton
  routes/
    division2.ts         - Division 2 store/supplier/order routes
    dashboard.ts         - Dashboard routes
  division2/
    services/division2Service.ts  - Core business logic
    dashboard/           - Operator dashboard
    matching/            - Supplier matching algorithm
    po/                  - Purchase order engine
    stores/              - Multi-store manager
    tracking/            - Order tracking
    types.ts             - Shared types
    validation/schemas.ts - Zod validation schemas
  division3/             - Division 3 controller/service/routes
  divisions/
    division1/           - CLIN/pricing validation (government contracts)
    division3-dispatch/  - Dispatch services
  middleware/
    storeAuth.ts         - Store authentication middleware
  services/
    catalogLoader.ts     - Shopify product catalog fetcher
    catalogRegistry.ts   - In-memory catalog registry
prisma/
  schema.prisma          - PostgreSQL database schema
  migrations/            - Database migrations
```

## API Routes
- `GET /` - Health check
- `/division1` - CLIN/SKU pricing (government contracts)
  - `GET /ping` - Status check
  - `POST /quote` - Get price quote for CLIN/SKU
- `/division2` - Store/supplier/order management
  - `POST /store/register` - Register a store
  - `POST /store/settings` - Update store settings (auth required)
  - `POST /suppliers` - Create supplier (auth required)
  - `GET /suppliers` - List suppliers (auth required)
  - `POST /auto-fulfill` - Auto-fulfill with supplier matching (auth required)
  - `POST /generate-po` - Generate purchase order (auth required)
  - `POST /update-tracking` - Update order tracking (auth required)
  - `POST /close-order` - Close an order (auth required)
  - `GET /orders` - List orders (auth required)
  - `GET /logs` - Get activity logs (auth required)
  - `POST /load-catalog` - Load Shopify catalog (auth required)
- `/dashboard` - Operator dashboard views
- `/dispatch` - Dispatch services

## Authentication
Store-level authentication using Bearer tokens or `x-store-token` header. Tokens are auto-generated on store registration.

## Development
```bash
npm run dev     # Start with hot reload (ts-node-dev)
npm test        # Run Jest tests
```

## Database
Uses Replit's managed PostgreSQL database. Schema managed by Prisma.
```bash
npx prisma db push      # Sync schema changes
npx prisma generate     # Regenerate client
```

## Deployment
- Target: Autoscale
- Build: `npx prisma generate && npx tsc`
- Run: `node dist/server.js`
- Server listens on `0.0.0.0:3000`
