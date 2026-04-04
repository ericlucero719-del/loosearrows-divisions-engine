/**
 * MASTER SCRIPT — Build 10 Shopify Division Catalogs from LooseArrows Engine
 *
 * Pulls live products from the Division 1 API (not the in-memory registry directly,
 * which is always empty when run as a standalone script). Uses native Node 20 fetch.
 *
 * Run: SHOPIFY_STORE_DOMAIN=x SHOPIFY_ACCESS_TOKEN=y npm run shopify:sync
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN as string;
const ENGINE_BASE = process.env.ENGINE_BASE_URL ?? "http://localhost:3000";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN env vars");
}

// ─── 1. Define your 10 divisions ───────────────────────────────────────────

const divisions = [
  { id: 1,  title: "Division 1 — Product Intake",           handle: "division-1"  },
  { id: 2,  title: "Division 2 — Contract Alignment",        handle: "division-2"  },
  { id: 3,  title: "Division 3 — Requests & Work Orders",    handle: "division-3"  },
  { id: 4,  title: "Division 4 — Inventory & Assets",        handle: "division-4"  },
  { id: 5,  title: "Division 5 — Logistics & Fulfillment",   handle: "division-5"  },
  { id: 6,  title: "Division 6 — Compliance & Documentation",handle: "division-6"  },
  { id: 7,  title: "Division 7 — Vendors & Partners",        handle: "division-7"  },
  { id: 8,  title: "Division 8 — Agencies & Customers",      handle: "division-8"  },
  { id: 9,  title: "Division 9 — Financials",                handle: "division-9"  },
  { id: 10, title: "Division 10 — System Intelligence",      handle: "division-10" },
];

// ─── Engine API helpers ─────────────────────────────────────────────────────

// registry.products is a keyed object in the live server — not iterable directly
// from a standalone script. We fetch from the live API instead.
async function fetchRegistryProducts(): Promise<any[]> {
  const res = await fetch(`${ENGINE_BASE}/division/1/products`);
  if (!res.ok) throw new Error(`Engine ${res.status}: ${await res.text()}`);
  const data = await res.json() as any;
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null) return Object.values(data);
  return [];
}

async function fetchContractCatalog(contractId: string): Promise<any[]> {
  const res = await fetch(`${ENGINE_BASE}/division/2/contracts/${contractId}/catalog`);
  if (!res.ok) return [];
  return res.json() as Promise<any[]>;
}

// ─── Shopify helpers ────────────────────────────────────────────────────────

async function shopifyRequest(path: string, method: string, body?: any) {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01${path}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  if (!res.ok) throw new Error(`Shopify ${method} ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── 2. Blueprint functions ─────────────────────────────────────────────────

async function createShopifyCollection(division: typeof divisions[0]): Promise<number> {
  // Idempotent — returns existing collection ID if already created
  const existing = await shopifyRequest(
    `/custom_collections.json?handle=${division.handle}`, "GET"
  ) as any;

  if (existing.custom_collections?.length) {
    const id = existing.custom_collections[0].id as number;
    console.log(`  [exists] ${division.title} (ID: ${id})`);
    return id;
  }

  const data = await shopifyRequest("/custom_collections.json", "POST", {
    custom_collection: { title: division.title, handle: division.handle, published: true },
  }) as any;

  const id = data.custom_collection.id as number;
  console.log(`  [created] ${division.title} (ID: ${id})`);
  return id;
}

async function createShopifyProduct(product: any, division: typeof divisions[0]): Promise<number> {
  // Idempotent — updates if SKU already exists, creates if not
  const search = await shopifyRequest(
    `/products.json?fields=id,variants&limit=1` +
    `&title=${encodeURIComponent(product.productName ?? product.sku)}`,
    "GET"
  ) as any;

  const tags = [
    `division:${division.id}`,
    product.naics  ? `naics:${product.naics}`  : null,
    product.clin   ? `clin:${product.clin}`    : null,
    product.status ? `status:${product.status}`: null,
  ].filter(Boolean).join(",");

  const payload = {
    product: {
      title:        product.productName ?? product.sku,
      body_html:    product.description ?? "",
      vendor:       product.brand ?? "Loose Arrows",
      product_type: product.category ?? division.title,
      tags,
      variants: [{
        sku:   product.sku,
        price: (product.price ?? product.contractPrice ?? 0).toString(),
      }],
      images: product.imageUrl ? [{ src: product.imageUrl }] : [],
    },
  };

  const existing = search.products?.find(
    (p: any) => p.variants?.some((v: any) => v.sku === product.sku)
  );

  if (existing) {
    const data = await shopifyRequest(`/products/${existing.id}.json`, "PUT", payload) as any;
    console.log(`  [updated] ${product.sku} → ${division.title}`);
    return data.product.id as number;
  }

  const data = await shopifyRequest("/products.json", "POST", payload) as any;
  console.log(`  [created] ${product.sku} → ${division.title}`);
  return data.product.id as number;
}

async function addProductToCollection(productId: number, collectionId: number) {
  // Idempotent — skips if collect already exists
  const existing = await shopifyRequest(
    `/collects.json?product_id=${productId}&collection_id=${collectionId}`, "GET"
  ) as any;
  if (existing.collects?.length) return;

  await shopifyRequest("/collects.json", "POST", {
    collect: { product_id: productId, collection_id: collectionId },
  });
}

// ─── Per-division product selection ────────────────────────────────────────

async function getProductsForDivision(division: typeof divisions[0], allProducts: any[]): Promise<any[]> {
  switch (division.id) {
    case 1:
      return allProducts;   // Full intake catalog
    case 2: {
      const catalog = await fetchContractCatalog("VA-BPA-001").catch(() => []);
      return catalog.map((ci: any) => ({
        ...(allProducts.find(p => p.sku === ci.sku) ?? {}),
        ...ci,
        price: ci.contractPrice,
      }));
    }
    case 4:
      return allProducts;   // Inventory-held SKUs
    default:
      return [];            // Operational divisions — collections created, left empty
  }
}

// ─── 3. Main builder ────────────────────────────────────────────────────────

async function buildAllDivisionCatalogs() {
  console.log(`Fetching products from engine at ${ENGINE_BASE}...`);
  const allProducts = await fetchRegistryProducts();

  if (!allProducts.length) {
    console.warn("No products found. Import products via POST /division/1/products/import first.");
    process.exit(1);
  }

  console.log(`Found ${allProducts.length} product(s). Syncing 10 divisions to Shopify...\n`);

  for (const division of divisions) {
    console.log(`\n=== Division ${division.id}: ${division.title} ===`);
    const collectionId = await createShopifyCollection(division);
    const products = await getProductsForDivision(division, allProducts);

    if (!products.length) {
      console.log(`  No products for this division.`);
      continue;
    }

    for (const product of products) {
      const productId = await createShopifyProduct(product, division);
      await addProductToCollection(productId, collectionId);
    }
  }

  console.log("\n✓ All 10 division catalogs synced to Shopify.");
}

buildAllDivisionCatalogs().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
