// src/stripe/webhookHandlers.ts
// LooseArrows Supply & Logistics™ — Stripe Webhook Handler

import { getStripeSync } from './stripeClient';

export class WebhookHandlers {
  static async processWebhook(body: Buffer, signature: string): Promise<void> {
    const stripeSync = await getStripeSync();
    await stripeSync.processWebhook(body, signature);
  }
}
