"use strict";
// modules/pdf/pdf.service.ts
// Generates branded PDF documents for invoices, purchase orders, and capability statements.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdf = generateInvoicePdf;
exports.generatePoPdf = generatePoPdf;
exports.generateCapabilityStatementPdf = generateCapabilityStatementPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ── Brand palette ──────────────────────────────────────────────────────────────
const C = {
    black: "#0a0a0a",
    orange: "#FF6B00",
    darkOrange: "#cc5500",
    white: "#ffffff",
    lightGray: "#f5f5f5",
    midGray: "#888888",
    darkGray: "#333333",
    border: "#e0e0e0",
};
const FONT_REG = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const MARGIN = 50;
// ── Helpers ────────────────────────────────────────────────────────────────────
function usd(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function dateStr(d) {
    if (!d)
        return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function header(doc, title, refNo) {
    const w = doc.page.width;
    // Black header bar
    doc.rect(0, 0, w, 90).fill(C.black);
    // Company name
    doc.font(FONT_BOLD).fontSize(18).fillColor(C.orange).text("LOOSE ARROWS", MARGIN, 22);
    doc.font(FONT_REG).fontSize(9).fillColor("#aaaaaa").text("Supply & Logistics™", MARGIN, 44);
    doc.font(FONT_REG).fontSize(8).fillColor("#666666").text("www.loosearrows.com  |  ops@loosearrows.com", MARGIN, 58);
    // Document type + ref (right-aligned)
    doc.font(FONT_BOLD).fontSize(20).fillColor(C.white).text(title, 0, 20, { align: "right", width: w - MARGIN });
    doc.font(FONT_REG).fontSize(10).fillColor(C.orange).text(refNo, 0, 50, { align: "right", width: w - MARGIN });
    doc.moveDown(0).y;
    doc.y = 110;
}
function sectionLabel(doc, label) {
    doc.moveDown(0.6);
    doc.font(FONT_BOLD).fontSize(8).fillColor(C.orange)
        .text(label.toUpperCase(), MARGIN, doc.y);
    const lw = doc.page.width - MARGIN * 2;
    doc.moveTo(MARGIN, doc.y + 2).lineTo(MARGIN + lw, doc.y + 2).strokeColor(C.orange).lineWidth(0.5).stroke();
    doc.moveDown(0.4);
}
function kv(doc, key, value, col = MARGIN, colW = 220) {
    const y = doc.y;
    doc.font(FONT_BOLD).fontSize(8).fillColor(C.midGray).text(key, col, y);
    doc.font(FONT_REG).fontSize(9).fillColor(C.darkGray).text(value || "—", col + 90, y, { width: colW });
    doc.y = Math.max(doc.y, y + 14);
}
function lineItemsTable(doc, items) {
    const w = doc.page.width - MARGIN * 2;
    const cols = { clin: 50, sku: 80, desc: 180, qty: 50, unit: 70, ext: 70 };
    const y0 = doc.y + 8;
    // Header row
    doc.rect(MARGIN, y0, w, 18).fill(C.black);
    const heads = [
        { label: "CLIN", x: MARGIN },
        { label: "SKU", x: MARGIN + cols.clin },
        { label: "DESCRIPTION", x: MARGIN + cols.clin + cols.sku },
        { label: "QTY", x: MARGIN + cols.clin + cols.sku + cols.desc },
        { label: "UNIT PRICE", x: MARGIN + cols.clin + cols.sku + cols.desc + cols.qty },
        { label: "EXTENDED", x: MARGIN + cols.clin + cols.sku + cols.desc + cols.qty + cols.unit },
    ];
    doc.font(FONT_BOLD).fontSize(7).fillColor(C.white);
    heads.forEach(h => doc.text(h.label, h.x + 3, y0 + 5, { width: 80 }));
    let rowY = y0 + 18;
    items.forEach((item, i) => {
        const bg = i % 2 === 0 ? C.lightGray : C.white;
        doc.rect(MARGIN, rowY, w, 16).fill(bg);
        doc.font(FONT_REG).fontSize(8).fillColor(C.darkGray);
        doc.text(item.clin ?? "—", heads[0].x + 3, rowY + 4, { width: cols.clin - 4 });
        doc.text(item.sku ?? "—", heads[1].x + 3, rowY + 4, { width: cols.sku - 4 });
        doc.text(item.description ?? "—", heads[2].x + 3, rowY + 4, { width: cols.desc - 6 });
        doc.text(String(item.quantity), heads[3].x + 3, rowY + 4, { width: cols.qty - 4 });
        doc.text(usd(item.unitPrice), heads[4].x + 3, rowY + 4, { width: cols.unit - 4 });
        doc.text(usd(item.extended), heads[5].x + 3, rowY + 4, { width: cols.ext - 4 });
        rowY += 16;
    });
    // Total bar
    const total = items.reduce((s, i) => s + i.extended, 0);
    doc.rect(MARGIN, rowY, w, 22).fill(C.black);
    doc.font(FONT_BOLD).fontSize(10).fillColor(C.orange)
        .text("TOTAL", heads[4].x + 3, rowY + 6, { width: cols.unit })
        .text(usd(total), heads[5].x + 3, rowY + 6, { width: cols.ext });
    doc.y = rowY + 28;
    return total;
}
function footer(doc) {
    const w = doc.page.width;
    const y = doc.page.height - 40;
    doc.moveTo(MARGIN, y).lineTo(w - MARGIN, y).strokeColor(C.border).lineWidth(0.5).stroke();
    doc.font(FONT_REG).fontSize(7).fillColor(C.midGray)
        .text("Loose Arrows Supply & Logistics™  |  CAGE: TBD  |  UEI: TBD  |  This document is confidential.", MARGIN, y + 6, { align: "center", width: w - MARGIN * 2 });
}
// ── PDF Generators ─────────────────────────────────────────────────────────────
async function generateInvoicePdf(invoiceId, res) {
    const inv = await prisma.govInvoice.findUnique({
        where: { invoiceId },
        include: { lineItems: true },
    });
    if (!inv) {
        res.status(404).json({ error: "Invoice not found" });
        return;
    }
    const doc = new pdfkit_1.default({ size: "LETTER", margin: MARGIN, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${inv.invoiceRef}.pdf"`);
    doc.pipe(res);
    header(doc, "INVOICE", inv.invoiceRef);
    sectionLabel(doc, "Bill To / Parties");
    const mid = doc.page.width / 2;
    const y0 = doc.y;
    kv(doc, "Agency", inv.agencyName ?? "—", MARGIN, 200);
    kv(doc, "Vendor", inv.vendorName ?? "—", MARGIN, 200);
    doc.y = y0;
    kv(doc, "Status", inv.status, mid, 200);
    kv(doc, "Due Date", dateStr(inv.dueDate), mid, 200);
    kv(doc, "Paid At", dateStr(inv.paidAt), mid, 200);
    sectionLabel(doc, "Line Items");
    lineItemsTable(doc, inv.lineItems);
    sectionLabel(doc, "Payment Summary");
    kv(doc, "Invoice Total", usd(inv.totalAmount));
    kv(doc, "Paid Amount", usd(inv.paidAmount));
    kv(doc, "Balance Due", usd(inv.totalAmount - inv.paidAmount));
    if (inv.notes) {
        sectionLabel(doc, "Notes");
        doc.font(FONT_REG).fontSize(9).fillColor(C.darkGray).text(inv.notes, MARGIN);
    }
    footer(doc);
    doc.end();
}
async function generatePoPdf(poId, res) {
    const po = await prisma.govPO.findUnique({
        where: { poId },
        include: { lineItems: true },
    });
    if (!po) {
        res.status(404).json({ error: "Purchase order not found" });
        return;
    }
    const doc = new pdfkit_1.default({ size: "LETTER", margin: MARGIN, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="po-${po.poRef}.pdf"`);
    doc.pipe(res);
    header(doc, "PURCHASE ORDER", po.poRef);
    sectionLabel(doc, "Order Details");
    const mid = doc.page.width / 2;
    const y0 = doc.y;
    kv(doc, "Vendor", po.vendorName ?? "—", MARGIN, 200);
    kv(doc, "Agency", po.agencyName ?? "—", MARGIN, 200);
    doc.y = y0;
    kv(doc, "Status", po.status, mid, 200);
    kv(doc, "Issued", dateStr(po.createdAt), mid, 200);
    sectionLabel(doc, "Line Items");
    lineItemsTable(doc, po.lineItems);
    if (po.notes) {
        sectionLabel(doc, "Notes");
        doc.font(FONT_REG).fontSize(9).fillColor(C.darkGray).text(po.notes, MARGIN);
    }
    footer(doc);
    doc.end();
}
async function generateCapabilityStatementPdf(bidId, res) {
    const bid = await prisma.govBid.findUnique({
        where: { bidId },
        include: { lineItems: true, contract: true },
    });
    if (!bid) {
        res.status(404).json({ error: "Bid not found" });
        return;
    }
    const doc = new pdfkit_1.default({ size: "LETTER", margin: MARGIN, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="capability-statement-${bid.bidRef ?? bidId}.pdf"`);
    doc.pipe(res);
    header(doc, "CAPABILITY STATEMENT", bid.bidRef ?? bidId);
    sectionLabel(doc, "Submitting Entity");
    kv(doc, "Vendor", bid.vendorName ?? "—");
    kv(doc, "Status", bid.status);
    kv(doc, "Submitted", dateStr(bid.submittedAt));
    kv(doc, "Bid Value", usd(bid.totalValue));
    sectionLabel(doc, "Contract Reference");
    kv(doc, "Contract Title", bid.contract?.title ?? "—");
    kv(doc, "Agency", bid.contract?.agencyName ?? "—");
    kv(doc, "NAICS", bid.contract?.naicsCode ?? "—");
    kv(doc, "Solicitation #", bid.contract?.solicitationNumber ?? bid.contract?.contractRef ?? "—");
    sectionLabel(doc, "Core Capabilities");
    const capabilityText = "Loose Arrows Supply & Logistics\u2122 provides end-to-end government logistics and procurement support " +
        "including sourcing, compliance management, supply chain fulfilment, and last-mile delivery. " +
        "We are a performance-oriented, compliance-first operation registered in SAM.gov and experienced " +
        "in DLA, GSA, and agency-direct procurement channels.";
    doc.font(FONT_REG).fontSize(9).fillColor(C.darkGray).text(capabilityText, MARGIN, doc.y, {
        width: doc.page.width - MARGIN * 2, align: "justify",
    });
    sectionLabel(doc, "Quoted Line Items");
    lineItemsTable(doc, bid.lineItems);
    if (bid.notes) {
        sectionLabel(doc, "Additional Notes");
        doc.font(FONT_REG).fontSize(9).fillColor(C.darkGray).text(bid.notes, MARGIN);
    }
    sectionLabel(doc, "Certifications & Registrations");
    ["SAM.gov Registered", "CAGE Code \u2014 On File", "UEI \u2014 On File", "Small Business \u2014 Self-Certified"].forEach(c => {
        doc.font(FONT_REG).fontSize(9).fillColor(C.darkGray).text("  " + c, MARGIN + 10, doc.y);
    });
    footer(doc);
    doc.end();
}
//# sourceMappingURL=pdf.service.js.map