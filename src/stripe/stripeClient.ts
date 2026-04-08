// src/stripe/stripeClient.ts
// LooseArrows Supply & Logistics™ — Stripe Client
// Fetches credentials from Replit connection API — never hardcodes keys

import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials() {
  const hostname      = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken  = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) throw new Error('X-Replit-Token not found for repl/depl');

  const isProduction    = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnv       = isProduction ? 'production' : 'development';
  const url             = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', targetEnv);

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'X-Replit-Token': xReplitToken },
  });

  const data        = await response.json() as any;
  connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.publishable || !connectionSettings?.settings?.secret) {
    throw new Error(`Stripe ${targetEnv} connection not found`);
  }

  return {
    publishableKey: connectionSettings.settings.publishable as string,
    secretKey:      connectionSettings.settings.secret      as string,
  };
}

export async function getUncachableStripeClient(): Promise<InstanceType<typeof Stripe>> {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });
}

export async function getStripePublishableKey(): Promise<string> {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey(): Promise<string> {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey      = await getStripeSecretKey();
    stripeSync = new StripeSync({
      poolConfig: { connectionString: process.env.DATABASE_URL!, max: 2 },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
