// modules/division9/division9.service.ts
// Division 9 — Financials (Quotes, Invoices, Payments)

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { Quote, Invoice, QuoteLineItem, QuoteStatus, InvoiceStatus } from "./division9.types";

export class Division9Service {
  // Resolve quote by UUID id or quoteRef
  private resolveQuote(idOrRef: string): Quote | null {
    if (registry.quotes[idOrRef]) return registry.quotes[idOrRef] as Quote;
    return (Object.values(registry.quotes).find((q: any) => q.quoteRef === idOrRef) as Quote) ?? null;
  }

  // Build line items from contract catalog when none are provided
  private buildLineItemsFromContract(contractId: string): QuoteLineItem[] {
    const contract = registry.contracts[contractId] as any;
    if (!contract?.products?.length) return [];
    return contract.products.map((cp: any) => {
      const product = registry.products[cp.sku] as any;
      return {
        sku: cp.sku,
        description: `${product?.productName ?? cp.sku}${cp.notes ? " | " + cp.notes : ""}`,
        quantity: 1,
        unitPrice: cp.contractPrice,
        extended: cp.contractPrice,
      };
    });
  }

  createQuote(data: {
    quoteRef?: string;
    requestId?: string;
    contractId?: string;
    lineItems?: QuoteLineItem[];
  }): Quote | { error: string } {
    const now = new Date().toISOString();

    // Auto-build line items from contract catalog if not supplied
    let rawItems = data.lineItems ?? [];
    if (!rawItems.length && data.contractId) {
      rawItems = this.buildLineItemsFromContract(data.contractId);
    }
    if (!rawItems.length) {
      return { error: "No line items provided and no contract catalog found to build from" };
    }

    const lineItems = rawItems.map((li) => ({
      ...li,
      extended: li.quantity * li.unitPrice,
    }));
    const totalAmount = lineItems.reduce((sum, li) => sum + li.extended, 0);

    const quote: Quote = {
      id: randomUUID(),
      quoteRef: data.quoteRef,
      requestId: data.requestId,
      contractId: data.contractId,
      lineItems,
      totalAmount,
      status: "Draft",
      createdAt: now,
      updatedAt: now,
    };
    registry.quotes[quote.id] = quote;
    return quote;
  }

  updateQuoteStatus(id: string, status: QuoteStatus): Quote | null {
    const quote = registry.quotes[id] as Quote;
    if (!quote) return null;
    quote.status = status;
    quote.updatedAt = new Date().toISOString();
    return quote;
  }

  listQuotes(): Quote[] {
    return Object.values(registry.quotes) as Quote[];
  }

  getQuote(id: string): Quote | null {
    return (registry.quotes[id] as Quote) ?? null;
  }

  createInvoice(quoteIdOrRef: string, options?: { billingAddress?: string; invoiceRef?: string }): Invoice | null {
    const quote = this.resolveQuote(quoteIdOrRef);
    if (!quote) return null;

    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: randomUUID(),
      invoiceRef: options?.invoiceRef,
      quoteId: quote.id,
      quoteRef: quote.quoteRef,
      requestId: quote.requestId,
      contractId: quote.contractId,
      billingAddress: options?.billingAddress,
      totalAmount: quote.totalAmount,
      paidAmount: 0,
      status: "Unpaid",
      createdAt: now,
      updatedAt: now,
    };
    registry.invoices[invoice.id] = invoice;
    return invoice;
  }

  recordPayment(invoiceId: string, amount: number): Invoice | null {
    const invoice = registry.invoices[invoiceId] as Invoice;
    if (!invoice) return null;

    invoice.paidAmount += amount;
    invoice.updatedAt = new Date().toISOString();

    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = "Paid";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "Partial";
    }
    return invoice;
  }

  listInvoices(): Invoice[] {
    return Object.values(registry.invoices) as Invoice[];
  }

  getInvoice(id: string): Invoice | null {
    return (registry.invoices[id] as Invoice) ?? null;
  }
}

export const division9Service = new Division9Service();
