/**
 * scripts/bootstrapStore.ts
 * Bootstraps the full Shopify store structure for LooseArrows Supply & Logistics.
 * Creates 10 category collections and 4 core federal pages in one shot.
 *
 * Live run:
 *   SHOPIFY_STORE_DOMAIN=my-store.myshopify.com \
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxxx \
 *   npm run shopify:bootstrap
 *
 * Dry run (no credentials needed — just previews what would be created):
 *   npm run shopify:bootstrap -- --dry-run
 */

const DRY_RUN = process.argv.includes("--dry-run");
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!DRY_RUN && (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN)) {
  console.error("Error: SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN env vars are required.");
  console.error("Tip: run with --dry-run to preview without credentials.");
  process.exit(1);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  key: string;
  handle: string;
  title: string;
  description: string;
}

interface Page {
  title: string;
  handle: string;
  body_html: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

const categories: Category[] = [
  { key: "Toner",        handle: "toner-imaging",          title: "Toner & Imaging",          description: "High-yield toner, drums, and imaging supplies ready for agency print environments." },
  { key: "Medical",      handle: "medical-supply",          title: "Medical & Clinical",        description: "Clinical consumables and medical essentials for care, readiness, and response." },
  { key: "Tools",        handle: "tools-hardware",          title: "Tools & Hardware",          description: "Hand tools, power tools, and hardware for maintenance, repair, and operations." },
  { key: "Janitorial",   handle: "janitorial-supply",       title: "Janitorial & Sanitation",   description: "Cleaning chemicals, liners, and janitorial essentials for compliant facilities." },
  { key: "PPE",          handle: "ppe-safety",              title: "PPE & Safety",              description: "Gloves, masks, eye protection, and safety gear for frontline teams." },
  { key: "Office",       handle: "office-supplies",         title: "Office Supplies",           description: "Everyday office essentials—paper, pens, filing, and desk supplies." },
  { key: "IT",           handle: "it-electronics",          title: "IT & Electronics",          description: "Devices, peripherals, and connectivity for modern federal workspaces." },
  { key: "Construction", handle: "construction-industrial", title: "Construction & Industrial",  description: "Heavy-duty tools, materials, and industrial support for field operations." },
  { key: "Automotive",   handle: "automotive-emergency",    title: "Automotive & Emergency",    description: "Vehicle support, emergency kits, and mission-critical response gear." },
  { key: "Lab",          handle: "lab-measurement",         title: "Lab & Measurement",         description: "Lab equipment, testing supplies, and precision measurement tools." },
];

// ─── Pages ───────────────────────────────────────────────────────────────────

const pages: Page[] = [
  {
    title:     "Request a Quote",
    handle:    "request-a-quote",
    body_html: "<h1>Request a Quote</h1><p>Send your CLINs, SKUs, or requirements and we'll return a structured, contract-aligned quote—ready for your internal routing and approvals.</p><p>Email: quotes@loosearrows.com</p>",
  },
  {
    title:     "Capabilities Statement",
    handle:    "capabilities",
    body_html: "<h1>Capabilities Statement</h1><p>LooseArrows™ is a service-disabled veteran-owned small business (SDVOSB) specializing in fast, compliant federal supply across 10 mission-critical categories.</p>",
  },
  {
    title:     "NAICS Codes",
    handle:    "naics",
    body_html: "<h1>NAICS Codes</h1><p>Primary and supporting NAICS codes for LooseArrows™ federal supply operations.</p>",
  },
  {
    title:     "Contract Vehicles",
    handle:    "contracts",
    body_html: "<h1>Contract Vehicles</h1><p>Current and pending contract vehicles, BPAs, and IDIQs supported by LooseArrows™.</p>",
  },
];

// ─── Shopify request helper ───────────────────────────────────────────────────

async function shopifyRequest(path: string, method: string, body?: any): Promise<any> {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type":           "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN!,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`Shopify ${method} ${path} → ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// ─── Collection creation ──────────────────────────────────────────────────────

let dryRunId = 1000;

async function createCollection(category: Category): Promise<number> {
  if (DRY_RUN) {
    const id = dryRunId++;
    console.log(`  [DRY RUN] Would create collection:`);
    console.log(`    title:       ${category.title}`);
    console.log(`    handle:      ${category.handle}`);
    console.log(`    description: ${category.description}`);
    console.log(`    → simulated ID: ${id}`);
    return id;
  }

  const data = await shopifyRequest("/custom_collections.json", "POST", {
    custom_collection: {
      title:     category.title,
      handle:    category.handle,
      body_html: `<p>${category.description}</p>`,
      published: true,
    },
  });
  const id = data.custom_collection.id as number;
  console.log(`  Created collection "${category.title}" (ID: ${id})`);
  return id;
}

// ─── Page creation ────────────────────────────────────────────────────────────

async function createPage(page: Page): Promise<number> {
  if (DRY_RUN) {
    const id = dryRunId++;
    console.log(`  [DRY RUN] Would create page:`);
    console.log(`    title:  ${page.title}`);
    console.log(`    handle: ${page.handle}`);
    console.log(`    → simulated ID: ${id}`);
    return id;
  }

  const data = await shopifyRequest("/pages.json", "POST", {
    page: {
      title:     page.title,
      handle:    page.handle,
      body_html: page.body_html,
      published: true,
    },
  });
  const id = data.page.id as number;
  console.log(`  Created page "${page.title}" (ID: ${id})`);
  return id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) {
    console.log("=======================================================");
    console.log("  DRY RUN — nothing will be sent to Shopify");
    console.log("  Store: loosearrowslogistics.myshopify.com");
    console.log("=======================================================\n");
  } else {
    console.log(`Bootstrapping Shopify store: ${SHOPIFY_STORE_DOMAIN}`);
  }

  console.log("\n=== 10 Category Collections ===");
  for (const category of categories) {
    await createCollection(category);
  }

  console.log("\n=== 4 Core Federal Pages ===");
  for (const page of pages) {
    await createPage(page);
  }

  if (DRY_RUN) {
    console.log("\n=======================================================");
    console.log("  Dry run complete. 14 items would be created.");
    console.log("  When ready: add SHOPIFY_ACCESS_TOKEN and run live.");
    console.log("=======================================================");
  } else {
    console.log("\nStore structure bootstrap complete.");
  }
}

main().catch(err => {
  console.error("Error bootstrapping store:", err);
  process.exit(1);
});
