// modules/division3/division3.service.ts
// Division 3 — Requests, Work Orders & Bid Pipeline

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { WorkRequest, RequestType, RequestStatus, Bid, BidStatus, BidLineItem } from "./division3.types";

let bidSeq = 0;
function nextBidRef() { return `BID-${String(++bidSeq).padStart(3, "0")}`; }

// ── Work Request service ───────────────────────────────────────────────────────
export class Division3Service {
  createRequest(data: {
    type: RequestType;
    requestorId: string;
    notes?: string;
  }): WorkRequest {
    const now = new Date().toISOString();
    const req: WorkRequest = {
      id: randomUUID(),
      type: data.type,
      requestorId: data.requestorId,
      productIds: [],
      status: "New",
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    registry.requests[req.id] = req;
    return req;
  }

  attachProducts(id: string, productIds: string[]): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    const unique = new Set([...req.productIds, ...productIds]);
    req.productIds = Array.from(unique);
    req.updatedAt = new Date().toISOString();
    return req;
  }

  linkContract(id: string, contractId: string): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    req.contractId = contractId;
    req.updatedAt = new Date().toISOString();
    return req;
  }

  updateStatus(id: string, status: RequestStatus): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    return req;
  }

  listRequests(): WorkRequest[] {
    return Object.values(registry.requests) as WorkRequest[];
  }

  getRequest(id: string): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    return {
      ...req,
      _products: req.productIds.map((sku: string) => registry.products[sku] ?? { sku }),
      _contract: req.contractId ? registry.contracts[req.contractId] : null,
    } as any;
  }

  // ── Bid Pipeline ─────────────────────────────────────────────────────────────

  // Active contracts available to place a bid on (status = active)
  getBidPipeline(): { contract: any; existingBidCount: number }[] {
    const contracts = Object.values(registry.contracts) as any[];
    const bids = Object.values(registry.bids) as Bid[];
    return contracts
      .filter(c => c.status === "active")
      .map(c => ({
        contract: c,
        existingBidCount: bids.filter(b => b.contractId === c.contractId).length,
      }));
  }

  // Create a new bid (starts as DRAFT)
  createBid(data: {
    contractId:   string;
    vendorId:     string;
    vendorName?:  string;
    requestId?:   string;
    lineItems?:   Omit<BidLineItem, "extended">[];
    notes?:       string;
    bidRef?:      string;
  }): Bid | { error: string } {
    const contract = registry.contracts[data.contractId] as any;
    if (!contract) return { error: `Contract ${data.contractId} not found` };

    // Build line items — from provided data, or auto-populate from contract catalog
    let raw: Omit<BidLineItem, "extended">[] = data.lineItems ?? [];
    if (!raw.length && contract.products?.length) {
      raw = contract.products.map((cp: any) => {
        const product = registry.products[cp.sku] as any;
        return {
          sku:         cp.sku,
          clin:        cp.clin,
          description: product?.productName ?? cp.sku,
          quantity:    1,
          unitPrice:   cp.contractPrice,
        };
      });
    }

    const lineItems: BidLineItem[] = raw.map(li => ({
      ...li,
      extended: li.quantity * li.unitPrice,
    }));

    const totalValue = lineItems.reduce((s, li) => s + li.extended, 0);
    const now = new Date().toISOString();

    const bid: Bid = {
      bidId:       randomUUID(),
      bidRef:      data.bidRef ?? nextBidRef(),
      contractId:  data.contractId,
      requestId:   data.requestId,
      vendorId:    data.vendorId,
      vendorName:  data.vendorName,
      status:      "DRAFT",
      lineItems,
      totalValue,
      notes:       data.notes,
      createdAt:   now,
      updatedAt:   now,
    };
    registry.bids[bid.bidId] = bid;
    return bid;
  }

  listBids(status?: BidStatus): Bid[] {
    const all = Object.values(registry.bids) as Bid[];
    return status ? all.filter(b => b.status === status) : all;
  }

  getBid(bidId: string): (Bid & { _contract?: any; _quote?: any }) | null {
    const bid = registry.bids[bidId] as Bid;
    if (!bid) return null;
    return {
      ...bid,
      _contract: registry.contracts[bid.contractId] ?? null,
      _quote:    bid.quoteId ? (registry.quotes[bid.quoteId] ?? null) : null,
    };
  }

  // Replace all line items on a DRAFT bid
  setLineItems(bidId: string, items: Omit<BidLineItem, "extended">[]): Bid | { error: string } {
    const bid = registry.bids[bidId] as Bid;
    if (!bid) return { error: "Bid not found" };
    if (bid.status !== "DRAFT") return { error: `Cannot edit line items on a ${bid.status} bid` };

    bid.lineItems = items.map(li => ({ ...li, extended: li.quantity * li.unitPrice }));
    bid.totalValue = bid.lineItems.reduce((s, li) => s + li.extended, 0);
    bid.updatedAt  = new Date().toISOString();
    return bid;
  }

  // Generate a Division 9 Quote from the bid and link it back
  generateQuote(bidId: string): { bid: Bid; quote: any } | { error: string } {
    const bid = registry.bids[bidId] as Bid;
    if (!bid) return { error: "Bid not found" };
    if (!bid.lineItems.length) return { error: "Bid has no line items — add items before generating a quote" };

    if (bid.quoteId && registry.quotes[bid.quoteId]) {
      return { bid, quote: registry.quotes[bid.quoteId] };
    }

    const now = new Date().toISOString();
    const quoteRef = bid.bidRef ? bid.bidRef.replace("BID-", "QUOTE-") : `QUOTE-${randomUUID().slice(0, 8)}`;
    const quote = {
      id:          randomUUID(),
      quoteRef,
      bidId:       bid.bidId,
      contractId:  bid.contractId,
      lineItems:   bid.lineItems.map(li => ({
        sku:         li.sku,
        description: li.description,
        quantity:    li.quantity,
        unitPrice:   li.unitPrice,
        extended:    li.extended,
      })),
      totalAmount: bid.totalValue,
      status:      "Draft",
      createdAt:   now,
      updatedAt:   now,
    };

    registry.quotes[quote.id] = quote;
    bid.quoteId  = quote.id;
    bid.quoteRef = quote.quoteRef;
    bid.updatedAt = now;
    return { bid, quote };
  }

  // Submit the bid — DRAFT → SUBMITTED, quote Draft → Sent
  submitBid(bidId: string): Bid | { error: string } {
    const bid = registry.bids[bidId] as Bid;
    if (!bid) return { error: "Bid not found" };
    if (bid.status !== "DRAFT") return { error: `Bid is already ${bid.status} — only DRAFT bids can be submitted` };
    if (!bid.lineItems.length) return { error: "Cannot submit a bid with no line items" };

    const now = new Date().toISOString();
    bid.status      = "SUBMITTED";
    bid.submittedAt = now;
    bid.updatedAt   = now;

    // Auto-generate quote if one doesn't exist yet
    if (!bid.quoteId) this.generateQuote(bidId);

    // Advance linked quote to Sent
    if (bid.quoteId) {
      const q = registry.quotes[bid.quoteId] as any;
      if (q && q.status === "Draft") {
        q.status    = "Sent";
        q.updatedAt = now;
      }
    }

    return bid;
  }

  // Update unit prices on any non-finalized bid (pre-award price correction)
  updatePricing(bidId: string, prices: { sku: string; unitPrice: number; quantity?: number }[]): Bid | { error: string } {
    const bid = registry.bids[bidId] as Bid;
    if (!bid) return { error: "Bid not found" };
    if (bid.status === "AWARDED" || bid.status === "LOST") {
      return { error: `Cannot update pricing on a ${bid.status} bid` };
    }

    const priceMap = new Map(prices.map(p => [p.sku, p]));
    bid.lineItems = bid.lineItems.map(li => {
      const update = priceMap.get(li.sku);
      if (!update) return li;
      const qty       = update.quantity ?? li.quantity;
      const unitPrice = update.unitPrice;
      return { ...li, quantity: qty, unitPrice, extended: qty * unitPrice };
    });
    bid.totalValue = bid.lineItems.reduce((s, li) => s + li.extended, 0);
    bid.updatedAt  = new Date().toISOString();

    // Sync linked quote if it exists
    if (bid.quoteId) {
      const q = registry.quotes[bid.quoteId] as any;
      if (q) {
        q.lineItems = bid.lineItems.map(li => ({
          sku: li.sku, description: li.description,
          quantity: li.quantity, unitPrice: li.unitPrice, extended: li.extended,
        }));
        q.totalAmount = bid.totalValue;
        q.updatedAt   = bid.updatedAt;
      }
    }

    // Also sync Division 1 product prices
    bid.lineItems.forEach(li => {
      const product = registry.products[li.sku] as any;
      if (product) {
        product.price      = li.unitPrice;
        product.lastSynced = bid.updatedAt;
      }
    });

    return bid;
  }

  // Update bid status (UNDER_REVIEW, AWARDED, LOST, WITHDRAWN)
  updateBidStatus(bidId: string, status: BidStatus): Bid | { error: string } {
    const bid = registry.bids[bidId] as Bid;
    if (!bid) return { error: "Bid not found" };

    const now = new Date().toISOString();
    bid.status    = status;
    bid.updatedAt = now;
    if (status === "AWARDED") bid.awardedAt = now;

    // Reflect outcome on linked quote
    if (bid.quoteId) {
      const q = registry.quotes[bid.quoteId] as any;
      if (q) {
        q.status    = status === "AWARDED" ? "Accepted" : status === "LOST" ? "Rejected" : q.status;
        q.updatedAt = now;
      }
    }

    return bid;
  }
}

export const division3Service = new Division3Service();
