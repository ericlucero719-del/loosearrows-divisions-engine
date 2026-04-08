// scripts/seed-stripe-products.ts
// LooseArrows Supply & Logistics™ — Stripe Product Seeder
//
// Creates the 3 reseller subscription tier products in Stripe (Sandbox).
// Run once: npx tsx scripts/seed-stripe-products.ts
//
// Products created:
//   STANDARD     $49/month  — up to $25K GMV/mo, 0.75% fee
//   PROFESSIONAL $149/month — up to $100K GMV/mo, 0.50% fee
//   ELITE        $499/month — unlimited GMV, 0.35% fee

import { getUncachableStripeClient } from '../src/stripe/stripeClient';

const PLANS = [
  {
    name:        'Reseller Standard',
    description: 'For resellers doing $5K–$25K/month. 0.75% platform fee. Full dashboard + payout access.',
    amount:      4900,       // $49.00/month
    metadata:    { tier: 'STANDARD', feeRate: '0.0075', maxMonthlyGmv: '25000' },
  },
  {
    name:        'Reseller Professional',
    description: 'For resellers doing $25K–$100K/month. 0.50% platform fee. Priority support + BTC payout.',
    amount:      14900,      // $149.00/month
    metadata:    { tier: 'PROFESSIONAL', feeRate: '0.005', maxMonthlyGmv: '100000' },
  },
  {
    name:        'Reseller Elite',
    description: 'Unlimited GMV. 0.35% platform fee. Dedicated account manager + Lightning payout + BTC credit line access.',
    amount:      49900,      // $499.00/month
    metadata:    { tier: 'ELITE', feeRate: '0.0035', maxMonthlyGmv: 'unlimited' },
  },
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('\n🏪 LooseArrows — Seeding Stripe Reseller Plans\n');

  for (const plan of PLANS) {
    // Check if already exists (idempotent)
    const existing = await stripe.products.search({ query: `name:'${plan.name}'` });
    if (existing.data.length > 0) {
      console.log(`✓ Already exists: ${plan.name} (${existing.data[0].id})`);
      continue;
    }

    const product = await stripe.products.create({
      name:        plan.name,
      description: plan.description,
      metadata:    plan.metadata,
    });

    const price = await stripe.prices.create({
      product:     product.id,
      unit_amount: plan.amount,
      currency:    'usd',
      recurring:   { interval: 'month' },
      metadata:    plan.metadata,
    });

    console.log(`✓ Created: ${plan.name}`);
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Price ID:   ${price.id}  ($${plan.amount / 100}/month)`);
    console.log(`  Tier:       ${plan.metadata.tier}  (${(parseFloat(plan.metadata.feeRate) * 100).toFixed(2)}% fee)\n`);
  }

  console.log('✅ Done. Plans are live in Stripe Sandbox.');
  console.log('   stripe-replit-sync will sync them to the local DB on next startup.\n');
}

seedProducts().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
