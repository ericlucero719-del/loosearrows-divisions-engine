/**
 * scripts/buildCategoryCatalogs.ts
 * Automatically builds 10 Shopify category catalogs from the LooseArrows engine.
 *
 * Run:
 *   SHOPIFY_STORE_DOMAIN=my-store.myshopify.com \
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxxx \
 *   ts-node scripts/buildCategoryCatalogs.ts
 *
 * Required env vars:
 *   SHOPIFY_STORE_DOMAIN  — e.g. "my-store.myshopify.com"
 *   SHOPIFY_ACCESS_TOKEN  — Shopify Admin API token
 *
 * Optional env vars:
 *   ENGINE_BASE_URL       — defaults to "http://localhost:3000"
 */

// NOTE: registry.products is an in-memory object keyed by SKU in the running
// server process. A standalone script cannot import it — the object is always
// empty outside the server. We fetch from the live Division 1 API instead.
const ENGINE_BASE = process.env.ENGINE_BASE_URL ?? "http://localhost:3000";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  console.error("Error: SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN env vars are required.");
  process.exit(1);
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  key: string;
  handle: string;
  title: string;
}

interface EngineProduct {
  productName?: string;
  sku: string;
  clin?: string;
  naics?: string;
  brand?: string;
  category?: string;
  description?: string;
  price?: number;
  cost?: number;
  margin?: number;
  status?: string;
  imageUrl?: string;
  source?: string;
  lastSynced?: string;
}

// ─── 1. Define 10 product categories ────────────────────────────────────────

const categories: Category[] = [
  { key: "Toner",        handle: "toner-imaging",          title: "Toner & Imaging"          },
  { key: "Medical",      handle: "medical-supply",          title: "Medical & Clinical"        },
  { key: "Tools",        handle: "tools-hardware",          title: "Tools & Hardware"          },
  { key: "Janitorial",   handle: "janitorial-supply",       title: "Janitorial & Sanitation"   },
  { key: "PPE",          handle: "ppe-safety",              title: "PPE & Safety"              },
  { key: "Office",       handle: "office-supplies",         title: "Office Supplies"           },
  { key: "IT",           handle: "it-electronics",          title: "IT & Electronics"          },
  { key: "Construction", handle: "construction-industrial", title: "Construction & Industrial"  },
  { key: "Automotive",   handle: "automotive-emergency",    title: "Automotive & Emergency"    },
  { key: "Lab",          handle: "lab-measurement",         title: "Lab & Measurement"         },
];

// ─── Engine API — replaces direct registry import ───────────────────────────

// registry.products is keyed by SKU ({ HP58X: {...} }), not an array.
// Fetching from the API and normalising to an array is the correct approach.
async function loadRegistryProducts(): Promise<EngineProduct[]> {
  const res = await fetch(`${ENGINE_BASE}/division/1/products`);
  if (!res.ok) throw new Error(`Engine responded ${res.status}: ${await res.text()}`);
  const data = await res.json() as any;
  if (Array.isArray(data)) return data as EngineProduct[];
  if (typeof data === "object" && data !== null) return Object.values(data) as EngineProduct[];
  return [];
}

// Simulates the shape expected by the rest of the script
const registry = {
  products: [] as EngineProduct[],
};

// ─── Shopify helper ──────────────────────────────────────────────────────────

async function shopifyRequest(path: string, method: string, body?: any) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type":            "application/json",
      "X-Shopify-Access-Token":  SHOPIFY_ACCESS_TOKEN!,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`Shopify ${method} ${path} returned ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// ─── 2. Shopify collection ───────────────────────────────────────────────────

async function createShopifyCollection(category: Category): Promise<number> {
  const data = await shopifyRequest("/custom_collections.json", "POST", {
    custom_collection: {
      title:     category.title,
      handle:    category.handle,
      published: true,
    },
  }) as any;
  return data.custom_collection.id as number;
}

// ─── 3. Shopify product ──────────────────────────────────────────────────────

async function createShopifyProduct(product: EngineProduct, category: Category): Promise<number> {
  const data = await shopifyRequest("/products.json", "POST", {
    product: {
      title:        product.productName || product.sku,
      body_html:    product.description || "",
      vendor:       product.brand || "LooseArrows",
      product_type: category.title,
      tags: [
        `category:${category.key}`,
        `category-title:${category.title}`,
        product.naics  ? `naics:${product.naics}`    : null,
        product.clin   ? `clin:${product.clin}`      : null,
        product.source ? `source:${product.source}`  : null,
      ].filter(Boolean),
      variants: [
        {
          sku:   product.sku,
          price: product.price ? product.price.toString() : "0.00",
        },
      ],
      images: product.imageUrl ? [{ src: product.imageUrl }] : [],
    },
  }) as any;
  return data.product.id as number;
}

// ─── 4. Link product → collection ───────────────────────────────────────────

async function addProductToCollection(productId: number, collectionId: number) {
  await shopifyRequest("/collects.json", "POST", {
    collect: {
      product_id:    productId,
      collection_id: collectionId,
    },
  });
}

// ─── Filter registry.products by category ───────────────────────────────────

function filterProductsByCategory(categoryKey: string): EngineProduct[] {
  return registry.products.filter(p =>
    (p.category || "").toLowerCase().includes(categoryKey.toLowerCase())
  );
}

// ─── Main builder ────────────────────────────────────────────────────────────

async function buildAllCategoryCatalogs() {
  // Load products from the live engine into the local registry shape
  registry.products = await loadRegistryProducts();

  if (!registry.products || registry.products.length === 0) {
    console.warn("No products found in registry.products. Import products via Division 1 before running this script.");
    return;
  }

  for (const category of categories) {
    console.log(`\n=== Building catalog for category: ${category.title} ===`);

    const collectionId = await createShopifyCollection(category);
    console.log(`Created collection ${category.title} (ID: ${collectionId})`);

    const products = filterProductsByCategory(category.key);

    if (products.length === 0) {
      console.warn(`No products found for category key "${category.key}". Skipping product creation.`);
      continue;
    }

    for (const product of products) {
      const productId = await createShopifyProduct(product, category);
      await addProductToCollection(productId, collectionId);
      console.log(`Linked product ${product.sku || product.productName} to ${category.title}`);
    }
  }

  console.log("\nAll 10 category catalogs built in Shopify.");
}

buildAllCategoryCatalogs().catch(err => {
  console.error("Error building category catalogs:", err);
  process.exit(1);
});
