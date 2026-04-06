// modules/division1/division 1 — Product Intake & Pricing

// ── 10 Product Categories ──────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  "OFFICE_SUPPLIES",
  "IT_ELECTRONICS",
  "SAFETY_PPE",
  "JANITORIAL_FACILITIES",
  "MEDICAL_HEALTH",
  "TOOLS_HARDWARE",
  "FURNITURE_FIXTURES",
  "UNIFORMS_APPAREL",
  "FOOD_CATERING",
  "VEHICLES_EQUIPMENT",
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export interface CategoryMeta {
  id:          ProductCategory;
  label:       string;
  description: string;
  naics:       string;   // primary NAICS code for this category
  productCount: number;
}

export const CATEGORY_META: Omit<CategoryMeta, "productCount">[] = [
  {
    id:          "OFFICE_SUPPLIES",
    label:       "Office Supplies & Stationery",
    description: "Paper, pens, binders, toner, shredders, and general office consumables.",
    naics:       "453210",
  },
  {
    id:          "IT_ELECTRONICS",
    label:       "IT & Electronics",
    description: "Computers, monitors, cables, networking gear, printers, and peripherals.",
    naics:       "423430",
  },
  {
    id:          "SAFETY_PPE",
    label:       "Safety & PPE",
    description: "Hard hats, gloves, hi-vis vests, eye protection, and fall-arrest equipment.",
    naics:       "423450",
  },
  {
    id:          "JANITORIAL_FACILITIES",
    label:       "Janitorial & Facilities",
    description: "Cleaning supplies, trash liners, dispensers, floor care, and maintenance items.",
    naics:       "424130",
  },
  {
    id:          "MEDICAL_HEALTH",
    label:       "Medical & Health",
    description: "First-aid kits, bandages, medications, AEDs, and clinical consumables.",
    naics:       "423450",
  },
  {
    id:          "TOOLS_HARDWARE",
    label:       "Tools & Hardware",
    description: "Hand tools, power tools, fasteners, adhesives, and shop supplies.",
    naics:       "423710",
  },
  {
    id:          "FURNITURE_FIXTURES",
    label:       "Furniture & Fixtures",
    description: "Desks, chairs, filing cabinets, shelving, cubicles, and modular storage.",
    naics:       "423210",
  },
  {
    id:          "UNIFORMS_APPAREL",
    label:       "Uniforms & Apparel",
    description: "Work uniforms, tactical clothing, embroidered items, and protective footwear.",
    naics:       "424300",
  },
  {
    id:          "FOOD_CATERING",
    label:       "Food & Catering",
    description: "Food service supplies, beverages, break-room consumables, and catering equipment.",
    naics:       "424490",
  },
  {
    id:          "VEHICLES_EQUIPMENT",
    label:       "Vehicles & Equipment",
    description: "Fleet parts, vehicle accessories, heavy equipment, and maintenance supplies.",
    naics:       "423110",
  },
];

// ── Product ────────────────────────────────────────────────────────────────────
export interface Product {
  productName: string;
  sku:         string;
  clin?:       string;
  naics?:      string;
  brand?:      string;
  category?:   ProductCategory;   // now typed — one of the 10 categories
  description?: string;
  price:       number;
  cost:        number;
  margin?:     number;
  status:      "active" | "inactive" | "pending";
  imageUrl?:   string;
  source?:     string;
  lastSynced?: string;
}
