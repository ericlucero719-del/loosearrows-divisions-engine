// src/stripe/routes.ts
// LooseArrows Supply & Logistics™ — Stripe Routes
//
// GET    /api/stripe/plans                   — list reseller subscription plans + prices
// GET    /api/stripe/publishable-key         — frontend Stripe.js publishable key
// POST   /api/stripe/subscribe               — create checkout session { email, priceId, resellerId }
// POST   /api/stripe/portal                  — customer billing portal { customerId }
// GET    /api/stripe/status/:resellerId      — check reseller subscription status
// POST   /api/stripe/fee/charge              — charge platform fee on a transaction { amount, description, customerId }
// GET    /api/stripe/revenue                 — platform-wide Stripe revenue summary
// GET    /api/stripe/payments                — recent successful payments

import { Router, Request, Response } from 'express';
import { requireApiKey } from '../middleware/apiKey';
import { getUncachableStripeClient, getStripePublishableKey } from './stripeClient';
import { getPlans, getCustomerByEmail, getSubscriptionByCustomer, getRevenueSummary, getRecentPayments } from './storage';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const BASE_URL = () =>
  process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

// ── Public: publishable key for frontend ──────────────────────────────────────
router.get('/publishable-key', async (_req: Request, res: Response) => {
  try {
    return res.json({ publishableKey: await getStripePublishableKey() });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

// ── Plans list (public — shown on signup page) ────────────────────────────────
// Queries Stripe API directly for real-time accuracy; falls back to local DB cache.
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const stripe   = await getUncachableStripeClient();
    const products = await stripe.products.list({ active: true, limit: 20 });
    const plans: any[] = [];

    for (const product of products.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      for (const price of prices.data) {
        plans.push({
          product_id:  product.id,
          name:        product.name,
          description: product.description,
          metadata:    product.metadata,
          active:      product.active,
          price_id:    price.id,
          unit_amount: price.unit_amount,
          currency:    price.currency,
          recurring:   price.recurring,
        });
      }
    }

    // Sort by price ascending so STANDARD → PROFESSIONAL → ELITE
    plans.sort((a, b) => (a.unit_amount || 0) - (b.unit_amount || 0));
    return res.json(plans);
  } catch (e: any) {
    // Fallback to local DB cache if Stripe API is unavailable
    try {
      return res.json(await getPlans());
    } catch {
      return res.status(500).json({ error: e.message });
    }
  }
});

// ── Checkout session — reseller subscribes to a tier plan ─────────────────────
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, priceId, resellerId, resellerRef } = req.body;
    if (!email || !priceId) return res.status(400).json({ error: 'email and priceId required' });

    const stripe = await getUncachableStripeClient();

    // Find or create Stripe customer
    let customer = await getCustomerByEmail(email);
    let customerId = customer?.id;

    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email,
        metadata: { resellerId: resellerId ?? '', resellerRef: resellerRef ?? '' },
      });
      customerId = newCustomer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer:            customerId,
      mode:                'subscription',
      payment_method_types:['card'],
      line_items:          [{ price: priceId, quantity: 1 }],
      success_url:         `${BASE_URL()}/join/success?session_id={CHECKOUT_SESSION_ID}&reseller_id=${resellerId ?? ''}`,
      cancel_url:          `${BASE_URL()}/join?cancelled=1`,
      metadata:            { resellerId: resellerId ?? '', resellerRef: resellerRef ?? '' },
      subscription_data:   { metadata: { resellerId: resellerId ?? '', platform: 'loosearrows' } },
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
});

// ── Customer billing portal ───────────────────────────────────────────────────
router.post('/portal', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: 'customerId required' });
    const stripe  = await getUncachableStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${BASE_URL()}/vendor-portal`,
    });
    return res.json({ url: session.url });
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
});

// ── Reseller subscription status ──────────────────────────────────────────────
router.get('/status/:resellerId', requireApiKey, async (req: Request, res: Response) => {
  try {
    const reseller = await (prisma as any).reseller.findFirst({
      where: { OR: [{ id: req.params.resellerId }, { resellerRef: req.params.resellerId }] },
    });
    if (!reseller) return res.status(404).json({ error: 'Reseller not found' });

    const customer = await getCustomerByEmail(reseller.email);
    if (!customer) return res.json({ reseller: reseller.resellerRef, hasStripeCustomer: false, subscription: null });

    const sub = await getSubscriptionByCustomer(customer.id);
    return res.json({
      reseller:        reseller.resellerRef,
      hasStripeCustomer: true,
      customerId:      customer.id,
      subscription:    sub ? {
        id:         sub.id,
        status:     sub.status,
        plan:       sub.metadata?.plan ?? null,
        currentPeriodEnd: sub.current_period_end,
      } : null,
    });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

// ── Charge platform fee on a transaction ─────────────────────────────────────
router.post('/fee/charge', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { amountUsd, description, customerId, resellerId } = req.body;
    if (!amountUsd) return res.status(400).json({ error: 'amountUsd required' });

    const stripe = await getUncachableStripeClient();
    const amountCents = Math.round(amountUsd * 100);

    const intent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: 'usd',
      customer: customerId ?? undefined,
      description: description ?? `LooseArrows platform fee`,
      metadata:    { resellerId: resellerId ?? '', type: 'platform_fee' },
      confirm:     false,
    });

    return res.json({
      paymentIntentId: intent.id,
      clientSecret:    intent.client_secret,
      amountUsd,
      status:          intent.status,
      note:            'Use the clientSecret on the frontend to complete payment with Stripe.js',
    });
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
});

// ── Platform revenue summary ──────────────────────────────────────────────────
router.get('/revenue', requireApiKey, async (_req: Request, res: Response) => {
  try {
    return res.json(await getRevenueSummary());
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

// ── Recent payments ───────────────────────────────────────────────────────────
router.get('/payments', requireApiKey, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    return res.json(await getRecentPayments(limit));
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

export default router;
