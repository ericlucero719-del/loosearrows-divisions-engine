// scripts/buildShopifyDivisionCatalogs.ts
// Pulls live products from the Division 1 API and pushes them into
// per-division Shopify collections. Uses native Node 20 fetch — no node-fetch needed.

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN as string;
const ENGINE_BASE = process.env.ENGINE_BASE_URL ?? "http://localhost:3000";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN env vars");
}

type DivisionConfig = {
  id: number;
  name: string;
  collectionTitle: string;
  collectionHandle: string;
};

const divisions: DivisionConfig[] = [
  { id: 1,  name: "Product Intake & Pricing",   collectionTitle: "Division 1 Catalog",  collectionHandle: "division-1"  },
  { id: 2,  name: "Contract Alignment",          collectionTitle: "Division 2 Catalog",  collectionHandle: "division-2"  },
  { id: 3,  name: "Requests & Work Orders",      collectionTitle: "Division 3 Catalog",  collectionHandle: "division-3"  },
  { id: 4,  name: "Inventory & Assets",          collectionTitle: "Division 4 Catalog",  collectionHandle: "division-4"  },
  { id: 5,  name: "Logistics & Fulfillment",     collectionTitle: "Division 5 Catalog",  collectionHandle: "division-5"  },
  { id: 6,  name: "Compliance & Documentation",  collectionTitle: "Division 6 Catalog",  collectionHandle: "division-6"  },
  { id: 7,  name: "Vendors & Partners",          collectionTitle: "Division 7 Catalog",  collectionHandle: "division-7"  },
  { id: 8,  name: "Agencies & Customers",        collectionTitle: "Division 8 Catalog",  collectionHandle: "division-8"  },
  { id: 9,  name: "Financials",                  collectionTitle: "Division 9 Catalog",  collectionHandle: "division-9"  },
  { id: 10, name: "System Intelligence",         collectionTitle: "Division 10 Catalog", collectionHandle: "division-10" },
];

// --- Engine API -----------------------------------------------------------------

async function fetchEngineProducts(): Promise<any[]> {
  const res = await fetch(`${ENGINE_BASE}/division/1/products`);
  if (!res.ok) throw new Error(`Engine API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as any;
  // Registry returns an object keyed by SKU — normalise to array
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null) return Object.values(data);
  return [];
}

async function fetchContractCatalog(contractId: string): Promise<any[]> {
  const res = await fetch(`${ENGINE_BASE}/division/2/contracts/${contractId}/catalog`);
  if (!res.ok) return [];
  return res.json() as Promise<any[]>;
}

// --- Shopify helpers ------------------------------------------------------------

async function shopifyRequest(path: string, method: string, body?: any) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${method} ${path} → ${res.status}: ${text}`);
  }

  return res.json();
}

async function getOrCreateCollection(title: string, handle: string): Promise<number> {
  // Check if collection already exists
  const existing = await shopifyRequest(
    `/custom_collections.json?handle=${handle}`, "GET"
  ) as any;

  if (existing.custom_collections?.length) {
    const id = existing.custom_collections[0].id as number;
    console.log(`  Collection "${title}" already exists (ID: ${id})`);
    return id;
  }

  const data = await shopifyRequest("/custom_collections.json", "POST", {
    custom_collection: { title, handle, published: true },
  }) as any;
  const id = data.custom_collection.id as number;
  console.log(`  Created collection "${title}" (ID: ${id})`);
  return id;
}

async function upsertShopifyProduct(product: any, division: DivisionConfig): Promise<number> {
  // Check if product already exists by SKU tag
  const search = await shopifyRequest(
    `/products.json?fields=id,variants&limit=1` +
    `&title=${encodeURIComponent(product.productName ?? product.sku)}`,
    "GET"
  ) as any;

  const tags = [
    `division:${division.id}`,
    `division-name:${division.name}`,
    product.naics  ? `naics:${product.naics}`   : null,
    product.clin   ? `clin:${product.clin}`      : null,
    product.status ? `status:${product.status}`  : null,
  ].filter(Boolean).join(",");

  const payload = {
    product: {
      title:        product.productName ?? product.sku,
      body_html:    product.description ?? "",
      vendor:       product.brand ?? "Loose Arrows",
      product_type: product.category ?? division.name,
      tags,
      variants: [{
        sku:   product.sku,
        price: (product.price ?? 0).toString(),
        cost:  product.cost ? product.cost.toString() : undefined,
      }],
      images: product.imageUrl ? [{ src: product.imageUrl }] : [],
    },
  };

  // Update if exists, create if not
  const existing = search.products?.find(
    (p: any) => p.variants?.some((v: any) => v.sku === product.sku)
  );

  if (existing) {
    const data = await shopifyRequest(`/products/${existing.id}.json`, "PUT", payload) as any;
    return data.product.id as number;
  }

  const data = await shopifyRequest("/products.json", "POST", payload) as any;
  return data.product.id as number;
}

async function linkProductToCollection(productId: number, collectionId: number) {
  // Avoid duplicate collects
  const existing = await shopifyRequest(
    `/collects.json?product_id=${productId}&collection_id=${collectionId}`, "GET"
  ) as any;
  if (existing.collects?.length) return;

  await shopifyRequest("/collects.json", "POST", {
    collect: { product_id: productId, collection_id: collectionId },
  });
}

// --- Per-division product selection ---------------------------------------------

async function getProductsForDivision(division: DivisionConfig, allProducts: any[]): Promise<any[]> {
  switch (division.id) {
    case 1:
      // Full catalog — all products imported through Division 1
      return allProducts;

    case 2: {
      // Contract-priced items — pull from the first active contract catalog
      const catalog = await fetchContractCatalog("VA-BPA-001").catch(() => []);
      // Enrich with full product data
      return catalog.map((ci: any) => {
        const base = allProducts.find(p => p.sku === ci.sku) ?? {};
        return { ...base, ...ci, price: ci.contractPrice };
      });
    }

    case 4:
      // Inventory-held products only
      return allProducts.filter(p => p.sku);

    default:
      // Divisions 3, 5–10: operational data, not product listings.
      // Return empty — collections are created but left unpopulated.
      return [];
  }
}

// --- Main ----------------------------------------------------------------------

async function buildDivisionCatalog(division: DivisionConfig, allProducts: any[]) {
  console.log(`\n=== Division ${division.id}: ${division.name} ===`);
  const collectionId = await getOrCreateCollection(division.collectionTitle, division.collectionHandle);

  const products = await getProductsForDivision(division, allProducts);

  if (!products.length) {
    console.log(`  No products for this division — collection created, left empty.`);
    return;
  }

  for (const p of products) {
    const productId = await upsertShopifyProduct(p, division);
    await linkProductToCollection(productId, collectionId);
    console.log(`  Synced ${p.sku ?? p.productName} → ${division.collectionTitle}`);
  }
}

async function main() {
  console.log(`Fetching products from engine at ${ENGINE_BASE}...`);
  const allProducts = await fetchEngineProducts();

  if (!allProducts.length) {
    console.warn("No products found. Import products via POST /division/1/products/import first.");
    process.exit(1);
  }

  console.log(`Found ${allProducts.length} product(s). Building Shopify catalogs...`);

  for (const division of divisions) {
    await buildDivisionCatalog(division, allProducts);
  }

  console.log("\nAll 10 division catalogs synced to Shopify.");
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
