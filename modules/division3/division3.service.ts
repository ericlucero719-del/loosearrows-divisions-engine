// modules/division3/division3.service.ts
// Division 3 — Requests, Work Orders & Bid Pipeline (PostgreSQL-backed)

import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { WorkRequest, RequestType, RequestStatus, Bid, BidStatus, BidLineItem } from "./division3.types";

const prisma = new PrismaClient();

// ── helpers ───────────────────────────────────────────────────────────────────

async function nextBidRef(): Promise<string> {
  const count = await prisma.govBid.count();
  return `BID-${String(count + 1).padStart(3, "0")}`;
}

function toWorkRequest(row: any): WorkRequest {
  return {
    id:          row.id,
    type:        row.type as RequestType,
    requestorId: row.requestorId,
    contractId:  row.contractId ?? undefined,
    productIds:  JSON.parse(row.productIdsJson || "[]"),
    status:      row.status as RequestStatus,
    notes:       row.notes ?? undefined,
    createdAt:   row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt:   row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}

function toBid(row: any): Bid {
  return {
    bidId:       row.bidId,
    bidRef:      row.bidRef ?? undefined,
    contractId:  row.contractId,
    requestId:   row.requestId  ?? undefined,
    vendorId:    row.vendorId,
    vendorName:  row.vendorName ?? undefined,
    status:      row.status as BidStatus,
    lineItems:   (row.lineItems ?? []).map((li: any): BidLineItem => ({
      sku:         li.sku,
      clin:        li.clin        ?? undefined,
      description: li.description ?? undefined,
      quantity:    li.quantity,
      unitPrice:   li.unitPrice,
      extended:    li.extended,
    })),
    totalValue:  row.totalValue,
    quoteId:     row.quoteId  ?? undefined,
    quoteRef:    row.quoteRef ?? undefined,
    notes:       row.notes    ?? undefined,
    submittedAt: row.submittedAt instanceof Date ? row.submittedAt.toISOString() : (row.submittedAt ?? undefined),
    awardedAt:   row.awardedAt   instanceof Date ? row.awardedAt.toISOString()   : (row.awardedAt   ?? undefined),
    createdAt:   row.createdAt   instanceof Date ? row.createdAt.toISOString()   : row.createdAt,
    updatedAt:   row.updatedAt   instanceof Date ? row.updatedAt.toISOString()   : row.updatedAt,
  };
}

// ── Work Request service ───────────────────────────────────────────────────────
export class Division3Service {
  async createRequest(data: { type: RequestType; requestorId: string; notes?: string }): Promise<WorkRequest> {
    const row = await prisma.govWorkRequest.create({
      data: {
        type:          data.type,
        requestorId:   data.requestorId,
        productIdsJson: "[]",
        status:        "New",
        notes:         data.notes ?? null,
      },
    });
    return toWorkRequest(row);
  }

  async attachProducts(id: string, productIds: string[]): Promise<WorkRequest | null> {
    const existing = await prisma.govWorkRequest.findUnique({ where: { id } });
    if (!existing) return null;
    const current: string[] = JSON.parse(existing.productIdsJson || "[]");
    const merged = Array.from(new Set([...current, ...productIds]));
    const row = await prisma.govWorkRequest.update({ where: { id }, data: { productIdsJson: JSON.stringify(merged) } });
    return toWorkRequest(row);
  }

  async linkContract(id: string, contractId: string): Promise<WorkRequest | null> {
    const existing = await prisma.govWorkRequest.findUnique({ where: { id } });
    if (!existing) return null;
    const row = await prisma.govWorkRequest.update({ where: { id }, data: { contractId } });
    return toWorkRequest(row);
  }

  async updateStatus(id: string, status: RequestStatus): Promise<WorkRequest | null> {
    const existing = await prisma.govWorkRequest.findUnique({ where: { id } });
    if (!existing) return null;
    const row = await prisma.govWorkRequest.update({ where: { id }, data: { status } });
    return toWorkRequest(row);
  }

  async listRequests(): Promise<WorkRequest[]> {
    const rows = await prisma.govWorkRequest.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toWorkRequest);
  }

  async getRequest(id: string): Promise<WorkRequest | null> {
    const row = await prisma.govWorkRequest.findUnique({ where: { id } });
    return row ? toWorkRequest(row) : null;
  }

  // ── Bid Pipeline ─────────────────────────────────────────────────────────────

  async getBidPipeline(): Promise<{ contract: any; existingBidCount: number }[]> {
    const contracts = await prisma.govContract.findMany({
      where:   { status: "active" },
      include: { bids: true, products: true },
    });
    return contracts.map(c => ({
      contract:         c,
      existingBidCount: c.bids.length,
    }));
  }

  async createBid(data: {
    contractId:   string;
    vendorId:     string;
    vendorName?:  string;
    requestId?:   string;
    lineItems?:   Omit<BidLineItem, "extended">[];
    notes?:       string;
    bidRef?:      string;
  }): Promise<Bid | { error: string }> {
    const contract = await prisma.govContract.findUnique({
      where:   { contractId: data.contractId },
      include: { products: true },
    });
    if (!contract) return { error: `Contract ${data.contractId} not found` };

    let raw: Omit<BidLineItem, "extended">[] = data.lineItems ?? [];
    if (!raw.length && contract.products.length) {
      raw = contract.products.map((cp: any) => ({
        sku:         cp.sku,
        clin:        cp.clin,
        description: cp.sku,
        quantity:    1,
        unitPrice:   cp.contractPrice,
      }));
    }

    const lineItemsData = raw.map(li => ({
      sku:         li.sku,
      clin:        li.clin        ?? null,
      description: li.description ?? null,
      quantity:    li.quantity,
      unitPrice:   li.unitPrice,
      extended:    li.quantity * li.unitPrice,
    }));
    const totalValue = lineItemsData.reduce((s, li) => s + li.extended, 0);
    const bidRef = data.bidRef ?? await nextBidRef();

    const row = await prisma.govBid.create({
      data: {
        bidRef,
        contractId:  data.contractId,
        requestId:   data.requestId  ?? null,
        vendorId:    data.vendorId,
        vendorName:  data.vendorName ?? null,
        status:      "DRAFT",
        totalValue,
        notes:       data.notes ?? null,
        lineItems:   { create: lineItemsData },
      },
      include: { lineItems: true },
    });
    return toBid(row);
  }

  async listBids(status?: BidStatus): Promise<Bid[]> {
    const rows = await prisma.govBid.findMany({
      where:   status ? { status } : undefined,
      include: { lineItems: true },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toBid);
  }

  async getBid(bidId: string): Promise<(Bid & { _contract?: any }) | null> {
    const row = await prisma.govBid.findUnique({
      where:   { bidId },
      include: { lineItems: true, contract: { include: { products: true } } },
    });
    if (!row) return null;
    return { ...toBid(row), _contract: row.contract ?? null };
  }

  async setLineItems(bidId: string, items: Omit<BidLineItem, "extended">[]): Promise<Bid | { error: string }> {
    const bid = await prisma.govBid.findUnique({ where: { bidId } });
    if (!bid) return { error: "Bid not found" };
    if (bid.status !== "DRAFT") return { error: `Cannot edit line items on a ${bid.status} bid` };

    const lineItemsData = items.map(li => ({
      sku:         li.sku,
      clin:        li.clin        ?? null,
      description: li.description ?? null,
      quantity:    li.quantity,
      unitPrice:   li.unitPrice,
      extended:    li.quantity * li.unitPrice,
    }));
    const totalValue = lineItemsData.reduce((s, li) => s + li.extended, 0);

    await prisma.govBidLineItem.deleteMany({ where: { bidId } });
    const row = await prisma.govBid.update({
      where:   { bidId },
      data:    { totalValue, lineItems: { create: lineItemsData } },
      include: { lineItems: true },
    });
    return toBid(row);
  }

  async generateQuote(bidId: string): Promise<{ bid: Bid; quote: any } | { error: string }> {
    const row = await prisma.govBid.findUnique({ where: { bidId }, include: { lineItems: true } });
    if (!row) return { error: "Bid not found" };
    if (!row.lineItems.length) return { error: "Bid has no line items — add items before generating a quote" };

    if (row.quoteId) {
      const bid = toBid(row);
      const quote = {
        id:          row.quoteId,
        quoteRef:    row.quoteRef,
        bidId:       row.bidId,
        contractId:  row.contractId,
        lineItems:   row.lineItems,
        totalAmount: row.totalValue,
        status:      "Draft",
      };
      return { bid, quote };
    }

    const quoteId  = randomUUID();
    const quoteRef = row.bidRef ? row.bidRef.replace("BID-", "QUOTE-") : `QUOTE-${randomUUID().slice(0, 8)}`;

    const updated = await prisma.govBid.update({
      where:   { bidId },
      data:    { quoteId, quoteRef },
      include: { lineItems: true },
    });
    const bid = toBid(updated);
    const quote = {
      id:          quoteId,
      quoteRef,
      bidId:       row.bidId,
      contractId:  row.contractId,
      lineItems:   row.lineItems,
      totalAmount: row.totalValue,
      status:      "Draft",
    };
    return { bid, quote };
  }

  async submitBid(bidId: string): Promise<Bid | { error: string }> {
    const row = await prisma.govBid.findUnique({ where: { bidId }, include: { lineItems: true } });
    if (!row) return { error: "Bid not found" };
    if (row.status !== "DRAFT") return { error: `Bid is already ${row.status} — only DRAFT bids can be submitted` };
    if (!row.lineItems.length) return { error: "Cannot submit a bid with no line items" };

    let quoteId  = row.quoteId;
    let quoteRef = row.quoteRef;
    if (!quoteId) {
      quoteId  = randomUUID();
      quoteRef = row.bidRef ? row.bidRef.replace("BID-", "QUOTE-") : `QUOTE-${randomUUID().slice(0, 8)}`;
    }

    const updated = await prisma.govBid.update({
      where:   { bidId },
      data:    { status: "SUBMITTED", submittedAt: new Date(), quoteId, quoteRef },
      include: { lineItems: true },
    });
    return toBid(updated);
  }

  async updatePricing(bidId: string, prices: { sku: string; unitPrice: number; quantity?: number }[]): Promise<Bid | { error: string }> {
    const row = await prisma.govBid.findUnique({ where: { bidId }, include: { lineItems: true } });
    if (!row) return { error: "Bid not found" };
    if (row.status === "AWARDED" || row.status === "LOST") {
      return { error: `Cannot update pricing on a ${row.status} bid` };
    }

    const priceMap = new Map(prices.map(p => [p.sku, p]));
    for (const li of row.lineItems) {
      const update = priceMap.get(li.sku);
      if (!update) continue;
      const qty       = update.quantity ?? li.quantity;
      const unitPrice = update.unitPrice;
      await prisma.govBidLineItem.update({
        where: { id: li.id },
        data:  { quantity: qty, unitPrice, extended: qty * unitPrice },
      });
    }

    const refreshed = await prisma.govBid.findUnique({ where: { bidId }, include: { lineItems: true } });
    const totalValue = (refreshed!.lineItems).reduce((s: number, li: any) => s + li.extended, 0);
    const final = await prisma.govBid.update({
      where:   { bidId },
      data:    { totalValue },
      include: { lineItems: true },
    });
    return toBid(final);
  }

  async updateBidStatus(bidId: string, status: BidStatus): Promise<Bid | { error: string }> {
    const existing = await prisma.govBid.findUnique({ where: { bidId } });
    if (!existing) return { error: "Bid not found" };

    const row = await prisma.govBid.update({
      where:   { bidId },
      data:    { status, awardedAt: status === "AWARDED" ? new Date() : undefined },
      include: { lineItems: true },
    });
    return toBid(row);
  }
}

export const division3Service = new Division3Service();
