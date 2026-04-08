// src/stripe/storage.ts
// LooseArrows Supply & Logistics™ — Stripe Storage
// Queries the stripe schema synced by stripe-replit-sync (no direct API calls)

import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  return pool;
}

// ─── Products & Prices ────────────────────────────────────────────────────────

export async function getPlans() {
  const db = getPool();
  const result = await db.query(`
    SELECT
      p.id               AS product_id,
      p.name,
      p.description,
      p.metadata,
      p.active,
      pr.id              AS price_id,
      pr.unit_amount,
      pr.currency,
      pr.recurring
    FROM stripe.products p
    JOIN stripe.prices   pr ON pr.product = p.id AND pr.active = true
    WHERE p.active = true
    ORDER BY pr.unit_amount ASC
  `);
  return result.rows;
}

export async function getPriceById(priceId: string) {
  const db     = getPool();
  const result = await db.query(
    `SELECT * FROM stripe.prices WHERE id = $1`,
    [priceId],
  );
  return result.rows[0] ?? null;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomerByEmail(email: string) {
  const db     = getPool();
  const result = await db.query(
    `SELECT * FROM stripe.customers WHERE email = $1 LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function getCustomerById(customerId: string) {
  const db     = getPool();
  const result = await db.query(
    `SELECT * FROM stripe.customers WHERE id = $1`,
    [customerId],
  );
  return result.rows[0] ?? null;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscriptionByCustomer(customerId: string) {
  const db     = getPool();
  const result = await db.query(
    `SELECT * FROM stripe.subscriptions WHERE customer = $1 AND status IN ('active','trialing') ORDER BY created DESC LIMIT 1`,
    [customerId],
  );
  return result.rows[0] ?? null;
}

// ─── Revenue Summary ──────────────────────────────────────────────────────────

export async function getRevenueSummary() {
  const db = getPool();

  const charges = await db.query(`
    SELECT
      COALESCE(SUM(amount),0)          AS total_charged,
      COALESCE(SUM(amount_refunded),0) AS total_refunded,
      COUNT(*)                         AS total_charges,
      COUNT(*) FILTER (WHERE paid)     AS paid_charges
    FROM stripe.charges
    WHERE currency = 'usd'
  `);

  const subs = await db.query(`
    SELECT
      status,
      COUNT(*) AS count
    FROM stripe.subscriptions
    GROUP BY status
  `);

  const subMap: Record<string, number> = {};
  subs.rows.forEach((r: any) => { subMap[r.status] = parseInt(r.count); });

  const r = charges.rows[0];
  return {
    totalChargedUsd:     (parseInt(r.total_charged)   || 0) / 100,
    totalRefundedUsd:    (parseInt(r.total_refunded)  || 0) / 100,
    netRevenueUsd:       ((parseInt(r.total_charged) - parseInt(r.total_refunded)) || 0) / 100,
    totalCharges:        parseInt(r.total_charges)    || 0,
    paidCharges:         parseInt(r.paid_charges)     || 0,
    subscriptions:       subMap,
    activeSubscriptions: subMap['active'] || 0,
  };
}

// ─── Payment Intents ──────────────────────────────────────────────────────────

export async function getRecentPayments(limit = 20) {
  const db     = getPool();
  const result = await db.query(
    `SELECT id, amount, currency, status, description, created
     FROM stripe.payment_intents
     WHERE status = 'succeeded'
     ORDER BY created DESC LIMIT $1`,
    [limit],
  );
  return result.rows.map((r: any) => ({ ...r, amountUsd: r.amount / 100 }));
}
