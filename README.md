l# loosearrows-divisions-engine

Engine for managing divisions and logistics operations within Loose Arrows Supply Logistics

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:3000

## API

- GET / - Welcome message

### Division 2 Endpoints

- POST /division2/store/register
- POST /division2/store/settings
- POST /division2/load-catalog
- POST /division2/build-store
- POST /division2/suppliers (create supplier)
- GET  /division2/suppliers (list suppliers)
- POST /division2/auto-fulfill
- POST /division2/generate-po
- POST /division2/update-tracking
- POST /division2/close-order
- GET  /division2/orders
- GET /division2/logs

### Dashboard Endpoints

- GET /dashboard/orders
- GET /dashboard/po
- GET /dashboard/tracking
- GET /dashboard/performance
- GET /dashboard/errors
- GET /dashboard/automation-log
### Authentication

Most Division 2 endpoints (besides `/division2/store/register`) require a valid store token.

- Pass via `Authorization: Bearer <token>`
- Or via header `x-store-token: <token>`

The token is returned when you register a store and is stored in the `accessToken` field.
