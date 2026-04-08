"use strict";
// modules/division3/division3.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.division3Controller = void 0;
const division3_service_1 = require("./division3.service");
exports.division3Controller = {
    // ── Work Requests ────────────────────────────────────────────────────────────
    async createRequest(req, res) {
        const { type, requestorId, notes } = req.body;
        if (!type || !requestorId) {
            return res.status(400).json({ error: "type and requestorId are required" });
        }
        return res.status(201).json(await division3_service_1.division3Service.createRequest({ type, requestorId, notes }));
    },
    async attachProducts(req, res) {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ error: "productIds must be an array" });
        }
        const result = await division3_service_1.division3Service.attachProducts(req.params.id, productIds);
        if (!result)
            return res.status(404).json({ error: "Request not found" });
        return res.json(result);
    },
    async linkContract(req, res) {
        const { contractId } = req.body;
        if (!contractId)
            return res.status(400).json({ error: "contractId is required" });
        const result = await division3_service_1.division3Service.linkContract(req.params.id, contractId);
        if (!result)
            return res.status(404).json({ error: "Request not found" });
        return res.json(result);
    },
    async updateStatus(req, res) {
        const { status } = req.body;
        if (!status)
            return res.status(400).json({ error: "status is required" });
        const result = await division3_service_1.division3Service.updateStatus(req.params.id, status);
        if (!result)
            return res.status(404).json({ error: "Request not found" });
        return res.json(result);
    },
    async listRequests(_req, res) {
        return res.json(await division3_service_1.division3Service.listRequests());
    },
    async getRequest(req, res) {
        const result = await division3_service_1.division3Service.getRequest(req.params.id);
        if (!result)
            return res.status(404).json({ error: "Request not found" });
        return res.json(result);
    },
    // ── Bid Pipeline ─────────────────────────────────────────────────────────────
    // GET /division/3/bid-pipeline — active contracts open for bidding
    async getBidPipeline(_req, res) {
        return res.json(await division3_service_1.division3Service.getBidPipeline());
    },
    // POST /division/3/bids
    async createBid(req, res) {
        const { contractId, vendorId, vendorName, requestId, lineItems, notes, bidRef } = req.body;
        if (!contractId || !vendorId) {
            return res.status(400).json({ error: "contractId and vendorId are required" });
        }
        const result = await division3_service_1.division3Service.createBid({ contractId, vendorId, vendorName, requestId, lineItems, notes, bidRef });
        if ("error" in result)
            return res.status(400).json(result);
        return res.status(201).json(result);
    },
    // GET /division/3/bids  (optional ?status=DRAFT)
    async listBids(req, res) {
        const { status } = req.query;
        return res.json(await division3_service_1.division3Service.listBids(status));
    },
    // GET /division/3/bids/:id
    async getBid(req, res) {
        const result = await division3_service_1.division3Service.getBid(req.params.id);
        if (!result)
            return res.status(404).json({ error: "Bid not found" });
        return res.json(result);
    },
    // POST /division/3/bids/:id/line-items  — replace all line items on a DRAFT bid
    async setLineItems(req, res) {
        const { lineItems } = req.body;
        if (!Array.isArray(lineItems)) {
            return res.status(400).json({ error: "lineItems must be an array of { sku, quantity, unitPrice, clin?, description? }" });
        }
        const result = await division3_service_1.division3Service.setLineItems(req.params.id, lineItems);
        if ("error" in result)
            return res.status(400).json(result);
        return res.json(result);
    },
    // POST /division/3/bids/:id/quote  — generate a Division 9 quote from the bid
    async generateQuote(req, res) {
        const result = await division3_service_1.division3Service.generateQuote(req.params.id);
        if ("error" in result)
            return res.status(400).json(result);
        return res.json(result);
    },
    // POST /division/3/bids/:id/submit  — DRAFT → SUBMITTED, quote → Sent
    async submitBid(req, res) {
        const result = await division3_service_1.division3Service.submitBid(req.params.id);
        if ("error" in result)
            return res.status(400).json(result);
        return res.json(result);
    },
    // PATCH /division/3/bids/:id/status  — UNDER_REVIEW | AWARDED | LOST | WITHDRAWN
    async updateBidStatus(req, res) {
        const { status } = req.body;
        if (!status)
            return res.status(400).json({ error: "status is required" });
        const result = await division3_service_1.division3Service.updateBidStatus(req.params.id, status);
        if ("error" in result)
            return res.status(400).json(result);
        return res.json(result);
    },
    // PATCH /division/3/bids/:id/pricing  — update unit prices pre-award
    async updatePricing(req, res) {
        const { prices } = req.body;
        if (!Array.isArray(prices) || prices.length === 0) {
            return res.status(400).json({ error: "prices array is required" });
        }
        const result = await division3_service_1.division3Service.updatePricing(req.params.id, prices);
        if ("error" in result)
            return res.status(400).json(result);
        return res.json(result);
    },
    // GET /division/3/bids/:id/submission  — HTML capability statement
    async getSubmissionDoc(req, res) {
        const bid = await division3_service_1.division3Service.getBid(req.params.id);
        if (!bid || "error" in bid)
            return res.status(404).json({ error: "Bid not found" });
        const contract = bid._contract;
        const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const deadline = "April 16, 2026 — 12:00 PM MDT";
        const solNum = contract?.solicitationNumber || "NOIFCGIMCBPA26003";
        const agency = contract?.agency || "HHS/IHS — Navajo Area Indian Health Service";
        const title = contract?.title || "Gallup Indian Medical Center Blanket Purchase Agreement";
        const poc = contract?.poc || { name: "Felecia Chavez", email: "felecia.chavez@ihs.gov" };
        const naics = contract?.naics || "339113";
        const psc = contract?.psc || "6515";
        const lineRows = bid.lineItems.map((li, i) => {
            const clin = li.clin && li.clin !== "CLIN-000"
                ? li.clin
                : `CLIN-${String(i + 1).padStart(3, "0")}`;
            const unit = li.unitPrice > 0 ? `$${li.unitPrice.toFixed(2)}` : "TBD";
            const ext = li.extended > 0 ? `$${li.extended.toFixed(2)}` : "TBD";
            return `<tr>
        <td>${clin}</td>
        <td>${li.sku}</td>
        <td>${li.description}</td>
        <td class="num">${li.quantity}</td>
        <td class="num">${unit}</td>
        <td class="num">${ext}</td>
      </tr>`;
        }).join("\n");
        const total = bid.totalValue > 0 ? `$${bid.totalValue.toFixed(2)}` : "See individual CLINs";
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Capability Statement &amp; Price List — ${solNum}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11pt; color: #1a1a2e; background: #fff; padding: 40px; max-width: 900px; margin: auto; }
  header { border-bottom: 3px solid #0a3d62; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo-block h1 { font-size: 20pt; color: #0a3d62; letter-spacing: 1px; }
  .logo-block p  { font-size: 9pt; color: #555; margin-top: 2px; }
  .meta-block    { text-align: right; font-size: 9pt; color: #333; line-height: 1.6; }
  h2 { font-size: 13pt; color: #0a3d62; border-left: 4px solid #00b4d8; padding-left: 8px; margin: 22px 0 10px; }
  h3 { font-size: 11pt; color: #333; margin: 14px 0 6px; }
  p, li { line-height: 1.65; }
  ul { padding-left: 20px; margin: 6px 0; }
  .block { background: #f0f8ff; border: 1px solid #b0d4ea; border-radius: 6px; padding: 14px 18px; margin: 12px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
  th { background: #0a3d62; color: #fff; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #dde; vertical-align: top; }
  tr:nth-child(even) td { background: #f5faff; }
  .num { text-align: right; font-family: monospace; }
  .total-row td { font-weight: bold; background: #ddeeff !important; border-top: 2px solid #0a3d62; }
  .sig-block { margin-top: 40px; display: flex; gap: 60px; }
  .sig-line   { flex: 1; border-top: 1px solid #333; padding-top: 6px; font-size: 9pt; color: #555; }
  footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 8pt; color: #888; text-align: center; }
  .badge { display: inline-block; background: #0a3d62; color: #fff; font-size: 8pt; padding: 2px 8px; border-radius: 3px; margin-left: 8px; vertical-align: middle; }
  .warn { color: #c0392b; font-weight: bold; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<header>
  <div class="logo-block">
    <h1>LOOSE ARROWS SUPPLY LOGISTICS</h1>
    <p>Government Medical Supply Division &nbsp;|&nbsp; NAICS 339113 &nbsp;|&nbsp; PSC 6515</p>
  </div>
  <div class="meta-block">
    <strong>CAPABILITY STATEMENT &amp; PRICE LIST</strong><br/>
    Solicitation: <strong>${solNum}</strong><br/>
    Date: ${now}<br/>
    Quote Ref: <strong>${bid.quoteRef || "QUOTE-002"}</strong>
  </div>
</header>

<h2>1. Submission Details</h2>
<div class="block">
  <table style="width:100%;border:none;font-size:10.5pt;">
    <tr><td style="width:160px;font-weight:bold;border:none;padding:4px 0;">Solicitation No.</td><td style="border:none;padding:4px 0;">${solNum}</td></tr>
    <tr><td style="font-weight:bold;border:none;padding:4px 0;">Contracting Agency</td><td style="border:none;padding:4px 0;">${agency}</td></tr>
    <tr><td style="font-weight:bold;border:none;padding:4px 0;">BPA Title</td><td style="border:none;padding:4px 0;">${title}</td></tr>
    <tr><td style="font-weight:bold;border:none;padding:4px 0;">NAICS / PSC</td><td style="border:none;padding:4px 0;">${naics} / ${psc}</td></tr>
    <tr><td style="font-weight:bold;border:none;padding:4px 0;">Submission Deadline</td><td style="border:none;padding:4px 0;" class="warn">${deadline}</td></tr>
    <tr><td style="font-weight:bold;border:none;padding:4px 0;">POC</td><td style="border:none;padding:4px 0;">${poc.name} &nbsp;<a href="mailto:${poc.email}">${poc.email}</a></td></tr>
  </table>
</div>

<h2>2. Vendor Capability Statement</h2>
<p><strong>Loose Arrows Supply Logistics</strong> is a specialized government medical supply distributor with demonstrated capability to source, stock, and deliver surgical consumables, wound care systems, and procedural supply kits to federal healthcare facilities nationwide, including IHS facilities in the Navajo Area.</p>

<h3>Core Competencies</h3>
<ul>
  <li>Surgical consumables distribution: sutures, staplers, laparoscopic instruments, electrosurgical accessories</li>
  <li>Wound care systems: KCI-equivalent vacuum-assisted closure (VAC) accessories including tubing sets, cassettes, and drape systems</li>
  <li>Procedural kits: open-abdomen management systems (ABThera-compatible), incision management, and infection control supplies</li>
  <li>Federal procurement compliance: SAM.gov registered, FAR Part 12/13 experienced, GSA Schedule-eligible</li>
  <li>Delivery capability to remote/rural IHS facilities; temperature-controlled logistics chain for Class II medical devices</li>
</ul>

<h3>Relevant Experience</h3>
<ul>
  <li>Demonstrated sourcing of J&amp;J/Ethicon product lines: sutures (STRATAFIX, Vicryl, PDS), endoscopic linear cutters (Echelon Flex), Endopath staplers</li>
  <li>KCI wound-care supply chain: VAC therapy accessories, ABThera Open Abdomen systems, Veralink cassette assemblies</li>
  <li>Electrosurgical accessories: PTFE-coated bovie blade electrodes, coagulation tips, disposable return electrodes</li>
  <li>Laparoscopic instrument supply: Veress/Veres access needles, curved insulated shears, trocar systems</li>
</ul>

<h3>Differentiators</h3>
<ul>
  <li>Consolidated single-vendor ordering for all 13 CLIN categories — reduces purchase order burden on facility staff</li>
  <li>Blanket Purchase Agreement pricing locked for contract period; no hidden fees or minimum order requirements</li>
  <li>Emergency fill capability within 48 hours for critical surgical consumables (CLIN-001, CLIN-004, CLIN-005, CLIN-006)</li>
  <li>Dedicated account manager assigned to Gallup IHS facility upon BPA award</li>
</ul>

<h2>3. Price List — All 13 CLINs</h2>
<p style="font-size:9.5pt;color:#555;margin-bottom:8px;">Prices are per-unit (each) unless otherwise noted. All prices are firm-fixed for the BPA ordering period. Quantities represent minimum order unit; larger orders receive volume pricing upon request.</p>
<table>
  <thead>
    <tr>
      <th>CLIN</th>
      <th>SKU / Part No.</th>
      <th>Description</th>
      <th class="num">Qty</th>
      <th class="num">Unit Price</th>
      <th class="num">Extended</th>
    </tr>
  </thead>
  <tbody>
    ${lineRows}
    <tr class="total-row">
      <td colspan="5">TOTAL ESTIMATED VALUE (Capability Statement Basis)</td>
      <td class="num">${total}</td>
    </tr>
  </tbody>
</table>
<p style="font-size:9pt;color:#555;margin-top:6px;"><em>* This is a capability statement and price list submission per the SAM.gov notice. Actual order quantities will vary based on facility requirements during the BPA ordering period. Pricing is indicative; final pricing subject to task order negotiation.</em></p>

<h2>4. Terms &amp; Conditions</h2>
<div class="block">
  <ul>
    <li><strong>Pricing Basis:</strong> All prices are FOB Destination, Gallup Indian Medical Center, Gallup NM 87301</li>
    <li><strong>Payment Terms:</strong> Net 30 days per FAR 52.232-25; accepts EFT/ACH</li>
    <li><strong>Delivery Lead Time:</strong> Standard 5–7 business days; expedited 48-hour service available for critical items</li>
    <li><strong>Minimum Order:</strong> No minimum order quantity; per-unit pricing applies to all BPA call orders</li>
    <li><strong>Warranty:</strong> All products are new, original equipment manufacturer (OEM) sourced, within manufacturer expiration dates at time of delivery</li>
    <li><strong>Substitutions:</strong> Equivalent or superior products may be offered with 48-hour advance notice and written approval from contracting officer</li>
    <li><strong>Compliance:</strong> All products comply with FDA 21 CFR requirements for Class II medical devices; full documentation available upon request</li>
  </ul>
</div>

<h2>5. Certifications &amp; Registrations</h2>
<div class="block">
  <ul>
    <li>SAM.gov Registration: Active (DUNS / UEI on file)</li>
    <li>NAICS Primary: 339113 — Surgical Appliance and Supplies Manufacturing</li>
    <li>PSC: 6515 — Medical and Surgical Instruments, Equipment, and Supplies</li>
    <li>Small Business Status: [Small Business / SB certification — confirm with contracting officer]</li>
    <li>Quality System: ISO 13485-aligned receiving inspection and inventory management</li>
  </ul>
</div>

<div class="sig-block">
  <div class="sig-line">
    Authorized Signature<br/>
    Name: _______________________________<br/>
    Title: _______________________________
  </div>
  <div class="sig-line">
    Date: _______________________________<br/>
    Phone: _______________________________<br/>
    Email: _______________________________
  </div>
</div>

<footer>
  Loose Arrows Supply Logistics &nbsp;|&nbsp; Government Medical Supply Division &nbsp;|&nbsp;
  Submitted in response to SAM.gov notice ${solNum} &nbsp;|&nbsp;
  Generated: ${now} &nbsp;|&nbsp; ${bid.bidRef} / ${bid.quoteRef || "QUOTE-002"}
</footer>

</body>
</html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(html);
    },
};
//# sourceMappingURL=division3.controller.js.map