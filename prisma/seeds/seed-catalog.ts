// prisma/seeds/seed-catalog.ts
// LooseArrows Supply & Logistics — 10-Division Supply Catalog Seed
// Loads GovProduct, GovVendor, and GovAgency records for all 10 divisions.
// Run: npx ts-node prisma/seeds/seed-catalog.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ─── PRODUCTS: 10 divisions × 10+ SKUs each ──────────────────────────────────

const PRODUCTS = [
  // ── DIV 1 — Office Supplies (NSN 75 | NAICS 424120) ──────────────────────
  { sku:"OFF-PAPER-CA",  name:"Copy Paper Case 8.5x11 (10 reams)",          category:"Office Supplies",    division:"1", unitPrice:55.00,  uom:"CS", naics:"424120" },
  { sku:"OFF-FOLD-LGL",  name:"Legal-Size Manila Folders (100 pk)",          category:"Office Supplies",    division:"1", unitPrice:18.50,  uom:"BX", naics:"424120" },
  { sku:"OFF-BIND-1IN",  name:"3-Ring Binder 1-inch (12 pk)",                category:"Office Supplies",    division:"1", unitPrice:29.95,  uom:"PK", naics:"424120" },
  { sku:"OFF-NOTE-3X3",  name:"Sticky Notes 3x3 Assorted (18 pads)",         category:"Office Supplies",    division:"1", unitPrice:14.25,  uom:"PK", naics:"424120" },
  { sku:"OFF-PEN-BALL",  name:"Ballpoint Pens Black Medium (60 pk)",         category:"Office Supplies",    division:"1", unitPrice:11.99,  uom:"BX", naics:"424120" },
  { sku:"OFF-STAPL-STD", name:"Standard Stapler with Staples (case 12)",     category:"Office Supplies",    division:"1", unitPrice:47.00,  uom:"CS", naics:"424120" },
  { sku:"OFF-TAPE-CLR",  name:"Clear Tape 3/4in Rolls (12 pk)",              category:"Office Supplies",    division:"1", unitPrice:16.50,  uom:"PK", naics:"424120" },
  { sku:"OFF-ENV-10",    name:"#10 Business Envelopes (500 pk)",             category:"Office Supplies",    division:"1", unitPrice:21.00,  uom:"BX", naics:"424120" },
  { sku:"OFF-CLIP-LG",   name:"Binder Clips Large Assorted (144 pk)",        category:"Office Supplies",    division:"1", unitPrice:9.75,   uom:"BX", naics:"424120" },
  { sku:"OFF-MARK-DRY",  name:"Dry Erase Markers Assorted (24 pk)",          category:"Office Supplies",    division:"1", unitPrice:22.50,  uom:"PK", naics:"424120" },

  // ── DIV 2 — IT & Toner (NSN 70 | NAICS 334118) ───────────────────────────
  { sku:"IT-TNR-HP05A",  name:"HP 05A Black Toner Cartridge",                category:"Toner & Ink",        division:"2", unitPrice:79.99,  uom:"EA", naics:"334118" },
  { sku:"IT-TNR-BR660",  name:"Brother TN-660 High-Yield Toner",             category:"Toner & Ink",        division:"2", unitPrice:64.99,  uom:"EA", naics:"334118" },
  { sku:"IT-TNR-CE505A", name:"HP 05A CE505A LaserJet Toner",                category:"Toner & Ink",        division:"2", unitPrice:72.00,  uom:"EA", naics:"334118" },
  { sku:"IT-DRUM-DR420", name:"Brother DR-420 Drum Unit",                    category:"Toner & Ink",        division:"2", unitPrice:55.00,  uom:"EA", naics:"334118" },
  { sku:"IT-USB-32GB",   name:"USB Flash Drive 32GB (10 pk)",                category:"IT Equipment",       division:"2", unitPrice:49.95,  uom:"PK", naics:"334118" },
  { sku:"IT-KBRD-USB",   name:"Wired USB Keyboard (5 pk)",                   category:"IT Equipment",       division:"2", unitPrice:89.00,  uom:"PK", naics:"334118" },
  { sku:"IT-MOUSE-USB",  name:"Wired USB Optical Mouse (5 pk)",              category:"IT Equipment",       division:"2", unitPrice:59.50,  uom:"PK", naics:"334118" },
  { sku:"IT-CAB-CAT6",   name:"CAT6 Ethernet Cable 25ft (10 pk)",            category:"IT Equipment",       division:"2", unitPrice:75.00,  uom:"PK", naics:"334118" },
  { sku:"IT-SWTCH-8PT",  name:"8-Port Gigabit Network Switch",               category:"IT Equipment",       division:"2", unitPrice:42.00,  uom:"EA", naics:"334118" },
  { sku:"IT-LAPT-I5",    name:"Laptop Computer Core i5 16GB 256SSD",         category:"IT Equipment",       division:"2", unitPrice:749.00, uom:"EA", naics:"334118" },

  // ── DIV 3 — Medical Supplies (NSN 65 | NAICS 339112) ─────────────────────
  { sku:"MED-GLVN-L",    name:"Nitrile Exam Gloves Large (case 1000)",       category:"Medical Supplies",   division:"3", unitPrice:89.00,  uom:"CS", naics:"339112" },
  { sku:"MED-GLVN-M",    name:"Nitrile Exam Gloves Medium (case 1000)",      category:"Medical Supplies",   division:"3", unitPrice:89.00,  uom:"CS", naics:"339112" },
  { sku:"MED-MASK-N95",  name:"N95 Respirator Masks (case 150)",             category:"Medical Supplies",   division:"3", unitPrice:145.00, uom:"CS", naics:"339112" },
  { sku:"MED-MASK-SURG", name:"Surgical Face Masks (case 500)",              category:"Medical Supplies",   division:"3", unitPrice:49.00,  uom:"CS", naics:"339112" },
  { sku:"MED-BAND-ASST", name:"Bandage Assortment Box (1000 ct)",            category:"Medical Supplies",   division:"3", unitPrice:38.50,  uom:"BX", naics:"339112" },
  { sku:"MED-GAUZE-4X4", name:"Gauze Pads 4x4 Sterile (200 pk)",            category:"Medical Supplies",   division:"3", unitPrice:24.00,  uom:"PK", naics:"339112" },
  { sku:"MED-ALCO-WIPE", name:"Alcohol Prep Wipes (case 1200)",              category:"Medical Supplies",   division:"3", unitPrice:31.00,  uom:"CS", naics:"339112" },
  { sku:"MED-KIT-TYPE1", name:"First Aid Kit Type I 107-pc",                 category:"Medical Supplies",   division:"3", unitPrice:49.99,  uom:"EA", naics:"339112" },
  { sku:"MED-BP-MON",    name:"Blood Pressure Monitor Digital",              category:"Medical Supplies",   division:"3", unitPrice:55.00,  uom:"EA", naics:"339112" },
  { sku:"MED-THERM-IR",  name:"Infrared No-Touch Thermometer",               category:"Medical Supplies",   division:"3", unitPrice:39.99,  uom:"EA", naics:"339112" },

  // ── DIV 4 — Food & Subsistence (NSN 89 | NAICS 311999) ───────────────────
  { sku:"FD-MRE-CS12",   name:"MRE Case 12 — Assorted Menus",               category:"Food & Subsistence", division:"4", unitPrice:145.00, uom:"CS", naics:"311999" },
  { sku:"FD-MRE-CS24",   name:"MRE Case 24 — Assorted Menus",               category:"Food & Subsistence", division:"4", unitPrice:289.00, uom:"CS", naics:"311999" },
  { sku:"FD-H2O-5GAL",   name:"Purified Water 5-Gallon Jugs (4 pk)",        category:"Food & Subsistence", division:"4", unitPrice:48.00,  uom:"PK", naics:"311999" },
  { sku:"FD-H2O-BTL24",  name:"Bottled Water 16.9oz (case 24)",             category:"Food & Subsistence", division:"4", unitPrice:8.99,   uom:"CS", naics:"311999" },
  { sku:"FD-COFF-5LB",   name:"Ground Coffee 5lb Can",                      category:"Food & Subsistence", division:"4", unitPrice:34.99,  uom:"EA", naics:"311999" },
  { sku:"FD-EBAR-CS24",  name:"Energy Bar Variety Case (24 ct)",            category:"Food & Subsistence", division:"4", unitPrice:42.00,  uom:"CS", naics:"311999" },
  { sku:"FD-FDRY-7DAY",  name:"Freeze-Dried Emergency Food 7-Day Supply",   category:"Food & Subsistence", division:"4", unitPrice:189.00, uom:"KT", naics:"311999" },
  { sku:"FD-HEAT-PKT",   name:"Flameless Ration Heater (case 36)",          category:"Food & Subsistence", division:"4", unitPrice:55.00,  uom:"CS", naics:"311999" },
  { sku:"FD-SALT-CS",    name:"Table Salt Packets (case 3000)",              category:"Food & Subsistence", division:"4", unitPrice:19.00,  uom:"CS", naics:"311999" },
  { sku:"FD-SUGAR-CS",   name:"Sugar Packets (case 2000)",                  category:"Food & Subsistence", division:"4", unitPrice:22.00,  uom:"CS", naics:"311999" },

  // ── DIV 5 — Janitorial & Facilities (NSN 79 | NAICS 325612) ──────────────
  { sku:"JAN-PTOWL-CS",  name:"Paper Towels 2-Ply Roll (case 30)",          category:"Janitorial",         division:"5", unitPrice:68.00,  uom:"CS", naics:"325612" },
  { sku:"JAN-TP-CS96",   name:"Toilet Paper 2-Ply (case 96 rolls)",         category:"Janitorial",         division:"5", unitPrice:79.00,  uom:"CS", naics:"325612" },
  { sku:"JAN-SOAP-GAL",  name:"Liquid Hand Soap 1-Gallon",                  category:"Janitorial",         division:"5", unitPrice:14.50,  uom:"EA", naics:"325612" },
  { sku:"JAN-HSAN-GAL",  name:"Hand Sanitizer 1-Gallon 70% Ethanol",        category:"Janitorial",         division:"5", unitPrice:22.00,  uom:"EA", naics:"325612" },
  { sku:"JAN-DWIPE-CS",  name:"Disinfectant Wipes (case 12 canisters)",     category:"Janitorial",         division:"5", unitPrice:59.00,  uom:"CS", naics:"325612" },
  { sku:"JAN-TBAG-CS",   name:"Trash Bags 55-Gallon (case 200)",            category:"Janitorial",         division:"5", unitPrice:89.00,  uom:"CS", naics:"325612" },
  { sku:"JAN-MOP-STR",   name:"String Mop Head 24oz (12 pk)",               category:"Janitorial",         division:"5", unitPrice:75.00,  uom:"PK", naics:"325612" },
  { sku:"JAN-BROOM-UP",  name:"Upright Broom with Handle (6 pk)",           category:"Janitorial",         division:"5", unitPrice:89.00,  uom:"PK", naics:"325612" },
  { sku:"JAN-CLNR-GAL",  name:"All-Purpose Cleaner Concentrate 1-Gallon",   category:"Janitorial",         division:"5", unitPrice:18.00,  uom:"EA", naics:"325612" },
  { sku:"JAN-DISP-GLVN", name:"Disposable Cleaning Gloves (case 1000)",     category:"Janitorial",         division:"5", unitPrice:49.00,  uom:"CS", naics:"325612" },

  // ── DIV 6 — Clothing & Uniforms (NSN 84 | NAICS 315190) ──────────────────
  { sku:"CLO-BOOT-CBT",  name:"Combat Boot Black Leather 8in (pair)",       category:"Clothing & Uniforms",division:"6", unitPrice:135.00, uom:"PR", naics:"315190" },
  { sku:"CLO-PANT-ACU",  name:"ACU Trousers Ripstop Medium Regular",        category:"Clothing & Uniforms",division:"6", unitPrice:49.99,  uom:"EA", naics:"315190" },
  { sku:"CLO-SHIRT-UTL", name:"Utility Shirt FRACU Medium Long Sleeve",     category:"Clothing & Uniforms",division:"6", unitPrice:42.00,  uom:"EA", naics:"315190" },
  { sku:"CLO-GLVS-LEA",  name:"Tactical Leather Gloves Medium",             category:"Clothing & Uniforms",division:"6", unitPrice:28.50,  uom:"PR", naics:"315190" },
  { sku:"CLO-SOCK-WL",   name:"Wool Blend Boot Socks (12 pair pack)",       category:"Clothing & Uniforms",division:"6", unitPrice:59.99,  uom:"PK", naics:"315190" },
  { sku:"CLO-VEST-MOL",  name:"MOLLE Tactical Vest One-Size",               category:"Clothing & Uniforms",division:"6", unitPrice:89.00,  uom:"EA", naics:"315190" },
  { sku:"CLO-HAT-PATROL",name:"Patrol Cap OCP Multicam Medium",             category:"Clothing & Uniforms",division:"6", unitPrice:22.00,  uom:"EA", naics:"315190" },
  { sku:"CLO-JACK-FIELD",name:"Field Jacket ECWCS Medium Regular",          category:"Clothing & Uniforms",division:"6", unitPrice:115.00, uom:"EA", naics:"315190" },
  { sku:"CLO-BELT-DUTY", name:"Duty Belt Nylon 2-inch Medium",              category:"Clothing & Uniforms",division:"6", unitPrice:19.50,  uom:"EA", naics:"315190" },
  { sku:"CLO-UND-QUICK", name:"Quick-Dry Undershirt 3-pack Medium",         category:"Clothing & Uniforms",division:"6", unitPrice:35.00,  uom:"PK", naics:"315190" },

  // ── DIV 7 — Industrial Tools & Hardware (NSN 51/52 | NAICS 423710) ────────
  { sku:"TL-HAMMER-16",  name:"16oz Rip Claw Hammer",                       category:"Tools & Hardware",   division:"7", unitPrice:22.50,  uom:"EA", naics:"423710" },
  { sku:"TL-SCRD-SET25", name:"Screwdriver Set 25-piece",                   category:"Tools & Hardware",   division:"7", unitPrice:39.99,  uom:"ST", naics:"423710" },
  { sku:"TL-DRILL-18V",  name:"18V Cordless Drill Driver Kit",              category:"Tools & Hardware",   division:"7", unitPrice:119.00, uom:"EA", naics:"423710" },
  { sku:"TL-WRENCH-ADJ", name:"Adjustable Wrench 12-inch",                  category:"Tools & Hardware",   division:"7", unitPrice:19.99,  uom:"EA", naics:"423710" },
  { sku:"TL-PLIER-SET",  name:"Plier Set 3-piece (Needle/Slip/Tongue)",     category:"Tools & Hardware",   division:"7", unitPrice:29.95,  uom:"ST", naics:"423710" },
  { sku:"TL-TAPE-25FT",  name:"Tape Measure 25-foot Inch/Metric",           category:"Tools & Hardware",   division:"7", unitPrice:14.99,  uom:"EA", naics:"423710" },
  { sku:"TL-LEVEL-4FT",  name:"4-Foot Aluminum Level",                      category:"Tools & Hardware",   division:"7", unitPrice:34.00,  uom:"EA", naics:"423710" },
  { sku:"TL-BOX-STL",    name:"Steel Toolbox 24-inch with Tray",            category:"Tools & Hardware",   division:"7", unitPrice:79.00,  uom:"EA", naics:"423710" },
  { sku:"TL-HACKSAW",    name:"Hacksaw 12-inch with Blades (5 pk)",         category:"Tools & Hardware",   division:"7", unitPrice:24.50,  uom:"EA", naics:"423710" },
  { sku:"TL-UTIL-KNIFE", name:"Utility Knife Heavy Duty with Blades (10)",  category:"Tools & Hardware",   division:"7", unitPrice:18.00,  uom:"EA", naics:"423710" },

  // ── DIV 8 — Safety & PPE (NSN 53 | NAICS 339113) ─────────────────────────
  { sku:"PPE-HHAT-WHT",  name:"Hard Hat Type II White with Ratchet",        category:"Safety & PPE",       division:"8", unitPrice:24.99,  uom:"EA", naics:"339113" },
  { sku:"PPE-VEST-OHV",  name:"Class 2 Safety Vest Hi-Vis Orange (Large)",  category:"Safety & PPE",       division:"8", unitPrice:12.50,  uom:"EA", naics:"339113" },
  { sku:"PPE-BOOT-STTOE",name:"Steel Toe Safety Boot Size 10 (pair)",       category:"Safety & PPE",       division:"8", unitPrice:89.00,  uom:"PR", naics:"339113" },
  { sku:"PPE-EPRO-33DB", name:"Foam Earplugs 33dB NRR (case 200 pair)",     category:"Safety & PPE",       division:"8", unitPrice:35.00,  uom:"CS", naics:"339113" },
  { sku:"PPE-GOGGLE-CLR",name:"Safety Goggles Clear Anti-Fog (12 pk)",      category:"Safety & PPE",       division:"8", unitPrice:49.00,  uom:"PK", naics:"339113" },
  { sku:"PPE-RESP-N95S", name:"N95 Half-Face Respirator Reusable (6 pk)",   category:"Safety & PPE",       division:"8", unitPrice:69.00,  uom:"PK", naics:"339113" },
  { sku:"PPE-FAK-50PC",  name:"First Aid Kit ANSI 50-person Class B",       category:"Safety & PPE",       division:"8", unitPrice:79.00,  uom:"EA", naics:"339113" },
  { sku:"PPE-FEXT-5ABC", name:"Fire Extinguisher 5lb ABC Dry Chemical",     category:"Safety & PPE",       division:"8", unitPrice:49.00,  uom:"EA", naics:"339113" },
  { sku:"PPE-GLVS-CUT5", name:"Cut-Resistant Gloves Level 5 (12 pair pk)",  category:"Safety & PPE",       division:"8", unitPrice:79.99,  uom:"PK", naics:"339113" },
  { sku:"PPE-SIGN-DGR",  name:"Danger Sign OSHA-Compliant 10x14 (10 pk)",  category:"Safety & PPE",       division:"8", unitPrice:29.00,  uom:"PK", naics:"339113" },

  // ── DIV 9 — Communications Equipment (NSN 58/59 | NAICS 334220) ──────────
  { sku:"COM-RADIO-VHF", name:"VHF/UHF Two-Way Radio 5W with Belt Clip",    category:"Communications",     division:"9", unitPrice:89.00,  uom:"EA", naics:"334220" },
  { sku:"COM-RADIO-16CH",name:"16-Channel Handheld Radio (6-pack)",          category:"Communications",     division:"9", unitPrice:399.00, uom:"PK", naics:"334220" },
  { sku:"COM-BATT-LIION",name:"Li-Ion Radio Battery Pack 2000mAh (6 pk)",   category:"Communications",     division:"9", unitPrice:89.00,  uom:"PK", naics:"334220" },
  { sku:"COM-CHRG-6BAY", name:"6-Bay Rapid Radio Charger Station",           category:"Communications",     division:"9", unitPrice:145.00, uom:"EA", naics:"334220" },
  { sku:"COM-HEADSET-HS",name:"Radio Headset with PTT Button (4 pk)",       category:"Communications",     division:"9", unitPrice:79.00,  uom:"PK", naics:"334220" },
  { sku:"COM-ANT-FLEX",  name:"Flexible Whip Antenna VHF 6-inch (12 pk)",   category:"Communications",     division:"9", unitPrice:59.00,  uom:"PK", naics:"334220" },
  { sku:"COM-COAX-50FT", name:"Coax Cable RG-8 50ft with PL-259 Connectors",category:"Communications",     division:"9", unitPrice:39.99,  uom:"EA", naics:"334220" },
  { sku:"COM-GPS-HH",    name:"Handheld GPS Navigator Rugged Military Grade",category:"Communications",     division:"9", unitPrice:249.00, uom:"EA", naics:"334220" },
  { sku:"COM-SAT-PHONE", name:"Satellite Phone Rental Monthly Plan",         category:"Communications",     division:"9", unitPrice:199.00, uom:"MO", naics:"334220" },
  { sku:"COM-REPEATER",  name:"VHF Repeater Station 50W with Duplexer",     category:"Communications",     division:"9", unitPrice:849.00, uom:"EA", naics:"334220" },

  // ── DIV 10 — Logistics Equipment (NSN 93 | NAICS 493110) ─────────────────
  { sku:"LOG-PALLET-WD", name:"Wood Pallet GMA 48x40 Standard (10 pk)",     category:"Logistics Equipment",division:"10",unitPrice:149.00, uom:"PK", naics:"493110" },
  { sku:"LOG-PJACK-5K",  name:"Manual Pallet Jack 5500lb Capacity",         category:"Logistics Equipment",division:"10",unitPrice:349.00, uom:"EA", naics:"493110" },
  { sku:"LOG-HTRUCK-4WH",name:"4-Wheel Hand Truck 600lb Capacity",          category:"Logistics Equipment",division:"10",unitPrice:89.00,  uom:"EA", naics:"493110" },
  { sku:"LOG-DOLLY-FLT", name:"Flat Moving Dolly 18x30 800lb (2 pk)",       category:"Logistics Equipment",division:"10",unitPrice:75.00,  uom:"PK", naics:"493110" },
  { sku:"LOG-WRAP-STR",  name:"Stretch Wrap Film 18in (case 4 rolls)",      category:"Logistics Equipment",division:"10",unitPrice:59.00,  uom:"CS", naics:"493110" },
  { sku:"LOG-TAPE-PKG",  name:"Packing Tape 2in 110yd (case 36 rolls)",     category:"Logistics Equipment",division:"10",unitPrice:79.00,  uom:"CS", naics:"493110" },
  { sku:"LOG-BOX-MED",   name:"Medium Shipping Box 18x14x12 (case 25)",     category:"Logistics Equipment",division:"10",unitPrice:55.00,  uom:"CS", naics:"493110" },
  { sku:"LOG-BOX-LRG",   name:"Large Shipping Box 24x18x18 (case 20)",      category:"Logistics Equipment",division:"10",unitPrice:69.00,  uom:"CS", naics:"493110" },
  { sku:"LOG-STRAP-RAT", name:"Ratchet Cargo Strap 2in x 27ft (4 pk)",     category:"Logistics Equipment",division:"10",unitPrice:49.99,  uom:"PK", naics:"493110" },
  { sku:"LOG-LABEL-4X6", name:"Shipping Labels 4x6 Direct Thermal (case 4k)",category:"Logistics Equipment",division:"10",unitPrice:89.00,uom:"CS", naics:"493110" },
];

// ─── VENDORS: 2 per division ──────────────────────────────────────────────────

const VENDORS = [
  // DIV 1 — Office Supplies
  { name:"Staples Business Advantage",   category:"Office Supplies",    naics:"424120", contactEmail:"gov@staples.com",    phone:"800-693-6393", duns:"125479834", cageCode:"3FPK0", setAside:"NONE", reliabilityScore:92 },
  { name:"Office Depot Federal",         category:"Office Supplies",    naics:"424120", contactEmail:"federal@officedepot.com", phone:"800-463-3768", duns:"968241703", cageCode:"4BTK2", setAside:"NONE", reliabilityScore:89 },

  // DIV 2 — IT & Toner
  { name:"CDW-G Government",             category:"Toner & Ink",        naics:"334118", contactEmail:"gov@cdwg.com",        phone:"800-808-4239", duns:"190180061", cageCode:"0PV99", setAside:"NONE", reliabilityScore:94 },
  { name:"Micro Center Federal",         category:"IT Equipment",       naics:"334118", contactEmail:"gov@microcenter.com", phone:"614-850-3000", duns:"623948102", cageCode:"7XKT1", setAside:"NONE", reliabilityScore:87 },

  // DIV 3 — Medical
  { name:"Medline Government Sales",     category:"Medical Supplies",   naics:"339112", contactEmail:"gov@medline.com",     phone:"800-633-5463", duns:"012345678", cageCode:"1PRZ9", setAside:"NONE", reliabilityScore:96 },
  { name:"Bound Tree Medical LLC",       category:"Medical Supplies",   naics:"339112", contactEmail:"sales@boundtree.com", phone:"800-533-0523", duns:"198273641", cageCode:"2WNX4", setAside:"SDVOSB", reliabilityScore:91 },

  // DIV 4 — Food
  { name:"DLA Troop Support East",       category:"Food & Subsistence", naics:"311999", contactEmail:"dla.subsistence@dla.mil", phone:"215-737-8000", duns:"067248910", cageCode:"5DLA1", setAside:"NONE", reliabilityScore:98 },
  { name:"Wornick Foods Government",     category:"Food & Subsistence", naics:"311999", contactEmail:"gov@wornick.com",     phone:"800-555-0199", duns:"345678912", cageCode:"6MRE2", setAside:"NONE", reliabilityScore:95 },

  // DIV 5 — Janitorial
  { name:"Diversey Federal",             category:"Janitorial",         naics:"325612", contactEmail:"gov@diversey.com",    phone:"888-352-2249", duns:"456789123", cageCode:"8JAN3", setAside:"NONE", reliabilityScore:90 },
  { name:"Grainger Industrial Federal",  category:"Janitorial",         naics:"325612", contactEmail:"gov@grainger.com",    phone:"800-472-4643", duns:"567891234", cageCode:"9GRW4", setAside:"NONE", reliabilityScore:97 },

  // DIV 6 — Clothing
  { name:"Propper International",        category:"Clothing & Uniforms",naics:"315190", contactEmail:"gov@propper.com",     phone:"888-776-7737", duns:"678912345", cageCode:"1CLO5", setAside:"NONE", reliabilityScore:93 },
  { name:"TenCate Protective Fabrics",   category:"Clothing & Uniforms",naics:"315190", contactEmail:"gov@tencate.com",     phone:"800-833-8373", duns:"789123456", cageCode:"2UNI6", setAside:"WOSB",  reliabilityScore:88 },

  // DIV 7 — Tools
  { name:"Grainger Government",          category:"Tools & Hardware",   naics:"423710", contactEmail:"govtools@grainger.com",phone:"800-472-4643", duns:"891234567", cageCode:"3TLS7", setAside:"NONE", reliabilityScore:97 },
  { name:"Snap-On Industrial Federal",   category:"Tools & Hardware",   naics:"423710", contactEmail:"gov@snapon.com",      phone:"877-762-7664", duns:"912345678", cageCode:"4SNP8", setAside:"NONE", reliabilityScore:99 },

  // DIV 8 — Safety/PPE
  { name:"Honeywell Safety Federal",     category:"Safety & PPE",       naics:"339113", contactEmail:"gov@honeywellsafety.com",phone:"800-430-5490", duns:"123456789", cageCode:"5HON9", setAside:"NONE", reliabilityScore:96 },
  { name:"3M Government Markets",        category:"Safety & PPE",       naics:"339113", contactEmail:"gov@3m.com",           phone:"888-364-3577", duns:"234567891", cageCode:"6TRM0", setAside:"NONE", reliabilityScore:97 },

  // DIV 9 — Communications
  { name:"Motorola Solutions Government",category:"Communications",     naics:"334220", contactEmail:"gov@motorolasolutions.com",phone:"800-367-2346", duns:"345678923", cageCode:"7MOT1", setAside:"NONE", reliabilityScore:99 },
  { name:"Kenwood Communications Federal",category:"Communications",    naics:"334220", contactEmail:"gov@kenwood.com",      phone:"310-639-9200", duns:"456789234", cageCode:"8KNW2", setAside:"SDVOSB", reliabilityScore:90 },

  // DIV 10 — Logistics
  { name:"Global Industrial Company",   category:"Logistics Equipment", naics:"493110", contactEmail:"gov@globalindustrial.com",phone:"888-978-7759", duns:"567892341", cageCode:"9GLB3", setAside:"NONE", reliabilityScore:88 },
  { name:"Uline Government Sales",      category:"Logistics Equipment", naics:"493110", contactEmail:"gov@uline.com",         phone:"800-295-5510", duns:"678923412", cageCode:"1ULN4", setAside:"NONE", reliabilityScore:95 },
];

// ─── AGENCIES ─────────────────────────────────────────────────────────────────

const AGENCIES = [
  { name:"Defense Logistics Agency (DLA)",               naicsJson: JSON.stringify(["311999","315190","339112","339113","493110"]),  agencyType:"Federal", department:"DoD" },
  { name:"General Services Administration (GSA)",         naicsJson: JSON.stringify(["424120","334118","325612","423710"]),          agencyType:"Federal", department:"GSA" },
  { name:"Dept of Veterans Affairs (VA)",                  naicsJson: JSON.stringify(["339112","339113","334220","424120"]),         agencyType:"Federal", department:"VA"  },
  { name:"Dept of Army — MICC",                            naicsJson: JSON.stringify(["315190","334220","339113","493110"]),         agencyType:"Military",department:"DoD" },
  { name:"Dept of Air Force — AFICA",                      naicsJson: JSON.stringify(["334220","334118","339113","493110"]),         agencyType:"Military",department:"DoD" },
  { name:"Dept of Navy — NAVSUP",                          naicsJson: JSON.stringify(["311999","315190","493110","339112"]),         agencyType:"Military",department:"DoD" },
  { name:"Dept of Homeland Security (DHS)",                naicsJson: JSON.stringify(["334220","339113","315190","424120"]),         agencyType:"Federal", department:"DHS" },
  { name:"FEMA — Logistics Div",                           naicsJson: JSON.stringify(["311999","493110","325612","339112"]),         agencyType:"Federal", department:"DHS" },
  { name:"Dept of Justice — BOP",                         naicsJson: JSON.stringify(["311999","315190","424120","325612"]),          agencyType:"Federal", department:"DOJ" },
  { name:"US Postal Service — Supply Chain",              naicsJson: JSON.stringify(["493110","423710","334118","424120"]),           agencyType:"Federal", department:"USPS"},
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding 10-Division Supply Catalog...\n");

  // Products — GovProduct fields: sku, name, description, category, unitOfMeasure, cost, price, marginPct, naics
  let prodCount = 0;
  for (const p of PRODUCTS) {
    const cost = Math.round(p.unitPrice * 0.75 * 100) / 100;   // 25% margin
    await (prisma as any).govProduct.upsert({
      where:  { sku: p.sku },
      update: { name: p.name, category: p.category, price: p.unitPrice, cost, unitOfMeasure: p.uom, naics: p.naics, marginPct: 0.25, description: `Division ${p.division} — ${p.category}` },
      create: { sku: p.sku, name: p.name, category: p.category, price: p.unitPrice, cost, unitOfMeasure: p.uom, naics: p.naics, marginPct: 0.25, description: `Division ${p.division} — ${p.category}` },
    });
    prodCount++;
  }
  console.log(`  ✔  ${prodCount} products seeded across 10 divisions`);

  // Vendors — GovVendor fields: name, categoriesJson, capabilitiesJson, performanceNotes, contactEmail, status
  let vendorCount = 0;
  for (const v of VENDORS) {
    const existing = await (prisma as any).govVendor.findFirst({ where: { name: v.name } });
    if (!existing) {
      await (prisma as any).govVendor.create({ data: {
        name:             v.name,
        contactEmail:     v.contactEmail,
        categoriesJson:   JSON.stringify([v.category]),
        capabilitiesJson: JSON.stringify([v.naics]),
        performanceNotes: `DUNS: ${v.duns} | CAGE: ${v.cageCode} | Set-Aside: ${v.setAside} | Reliability: ${v.reliabilityScore}% | Phone: ${v.phone}`,
        status:           "active",
      }});
      vendorCount++;
    }
  }
  console.log(`  ✔  ${vendorCount} vendors seeded (${VENDORS.length - vendorCount} already existed)`);

  // Agencies
  let agencyCount = 0;
  for (const a of AGENCIES) {
    const existing = await (prisma as any).govAgency.findFirst({ where: { name: a.name } });
    if (!existing) {
      await (prisma as any).govAgency.create({ data: { name: a.name, naicsJson: a.naicsJson, agencyType: a.agencyType, department: a.department, status: "active" } });
      agencyCount++;
    }
  }
  console.log(`  ✔  ${agencyCount} agencies seeded (${AGENCIES.length - agencyCount} already existed)`);

  console.log("\n✅  Catalog seed complete.");
  console.log(`   Products: ${prodCount} | Vendors: ${vendorCount} new | Agencies: ${agencyCount} new`);
}

main()
  .catch(e => { console.error("Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
