/**
 * BUILD 10 SHOPIFY CATEGORY CATALOGS
 * Toner, Medical, Tools, Janitorial, PPE, Office, IT, Construction, Automotive, Lab
 *
 * Run: SHOPIFY_STORE_DOMAIN=x SHOPIFY_ACCESS_TOKEN=y npm run shopify:categories
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN as string;
const ENGINE_BASE = process.env.ENGINE_BASE_URL ?? "http://localhost:3000";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN env vars");
}

// ─── 1. Define 10 category catalogs ────────────────────────────────────────

const categories = [
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

type Category = typeof categories[0];

// ─── Engine API ─────────────────────────────────────────────────────────────

async function fetchRegistryProducts(): Promise<any[]> {
  const res = await fetch(`${ENGINE_BASE}/division/1/products`);
  if (!res.ok) throw new Error(`Engine ${res.status}: ${await res.text()}`);
  const data = await res.json() as any;
  // Registry returns an object keyed by SKU — normalise to array
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null) return Object.values(data);
  return [];
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

// ─── 2. Create Shopify collection ───────────────────────────────────────────

async function createShopifyCollection(category: Category): Promise<number> {
  const existing = await shopifyRequest(
    `/custom_collections.json?handle=${category.handle}`, "GET"
  ) as any;

  if (existing.custom_collections?.length) {
    const id = existing.custom_collections[0].id as number;
    console.log(`  [exists]  ${category.title} (ID: ${id})`);
    return id;
  }

  const data = await shopifyRequest("/custom_collections.json", "POST", {
    custom_collection: {
      title:     category.title,
      handle:    category.handle,
      published: true,
    },
  }) as any;

  const id = data.custom_collection.id as number;
  console.log(`  [created] ${category.title} (ID: ${id})`);
  return id;
}

// ─── 3. Create Shopify product ──────────────────────────────────────────────

async function createShopifyProduct(product: any, category: Category): Promise<number> {
  // Check for existing product by SKU
  const search = await shopifyRequest(
    `/products.json?fields=id,variants&limit=1` +
    `&title=${encodeURIComponent(product.productName ?? product.sku)}`,
    "GET"
  ) as any;

  const tags = [
    `category:${category.key}`,
    product.naics  ? `naics:${product.naics}`  : null,
    product.clin   ? `clin:${product.clin}`    : null,
    product.brand  ? `brand:${product.brand}`  : null,
    product.status ? `status:${product.status}`: null,
  ].filter(Boolean).join(",");

  const payload = {
    product: {
      title:        product.productName ?? product.sku,
      body_html:    product.description ?? "",
      vendor:       product.brand ?? "Loose Arrows",
      product_type: category.title,
      tags,
      variants: [{
        sku:   product.sku,
        price: (product.price ?? 0).toString(),
      }],
      images: product.imageUrl ? [{ src: product.imageUrl }] : [],
    },
  };

  const existing = search.products?.find(
    (p: any) => p.variants?.some((v: any) => v.sku === product.sku)
  );

  if (existing) {
    const data = await shopifyRequest(`/products/${existing.id}.json`, "PUT", payload) as any;
    console.log(`    [updated] ${product.sku}`);
    return data.product.id as number;
  }

  const data = await shopifyRequest("/products.json", "POST", payload) as any;
  console.log(`    [created] ${product.sku}`);
  return data.product.id as number;
}

// ─── 4. Add product to collection ──────────────────────────────────────────

async function addProductToCollection(productId: number, collectionId: number) {
  const existing = await shopifyRequest(
    `/collects.json?product_id=${productId}&collection_id=${collectionId}`, "GET"
  ) as any;
  if (existing.collects?.length) return;

  await shopifyRequest("/collects.json", "POST", {
    collect: { product_id: productId, collection_id: collectionId },
  });
}

// ─── Filter registry.products by category ──────────────────────────────────

function filterByCategory(products: any[], category: Category): any[] {
  return products.filter(p => {
    const cat = (p.category ?? "").toLowerCase();
    const key = category.key.toLowerCase();
    // Match on category field or any tag/NAICS association
    return (
      cat === key ||
      cat.includes(key) ||
      (p.tags ?? []).some((t: string) => t.toLowerCase().includes(key))
    );
  });
}

// ─── Main builder ───────────────────────────────────────────────────────────

async function buildAllCategoryCatalogs() {
  console.log(`Fetching products from engine at ${ENGINE_BASE}...`);
  const allProducts = await fetchRegistryProducts();

  if (!allProducts.length) {
    console.warn("No products found. Import products via POST /division/1/products/import first.");
    process.exit(1);
  }

  console.log(`Found ${allProducts.length} product(s). Syncing 10 category catalogs to Shopify...\n`);

  for (const category of categories) {
    console.log(`\n=== ${category.title} ===`);

    const collectionId = await createShopifyCollection(category);

    // 2. Filter registry.products by category
    const products = filterByCategory(allProducts, category);

    if (!products.length) {
      console.log(`  No products matched category "${category.key}".`);
      continue;
    }

    console.log(`  ${products.length} product(s) matched.`);

    for (const product of products) {
      // 3. Create Shopify product
      const productId = await createShopifyProduct(product, category);
      // 4. Add to collection
      await addProductToCollection(productId, collectionId);
    }
  }

  console.log("\n✓ All 10 category catalogs synced to Shopify.");
}

buildAllCategoryCatalogs().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
