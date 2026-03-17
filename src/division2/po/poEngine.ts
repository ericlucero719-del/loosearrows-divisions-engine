import { PurchaseOrderRequest, PoEngineResult, SupplierMatchResult } from "../types";

export interface PoEngineOptions {
  enableLogging?: boolean;
  logger?: (message: string, meta?: unknown) => void;
}

export class PurchaseOrderEngine {
  private logs: Array<{ timestamp: string; message: string; meta?: unknown }> = [];
  private options: PoEngineOptions;

  constructor(options?: PoEngineOptions) {
    this.options = options ?? {};
  }

  public getLogs() {
    return this.logs;
  }

  private log(message: string, meta?: unknown) {
    const entry = { timestamp: new Date().toISOString(), message, meta };
    this.logs.push(entry);
    if (this.options.logger) {
      this.options.logger(message, meta);
    }
  }

  public async createPurchaseOrder(
    match: SupplierMatchResult,
    request: PurchaseOrderRequest
  ): Promise<PoEngineResult> {
    // Generate a PO number using a simple deterministic pattern.
    const poNumber = `PO-${Math.floor(Date.now() / 1000)}-${match.supplierId.slice(0, 6)}`;

    const poPayload = {
      poNumber,
      supplierId: match.supplierId,
      orderId: request.orderId,
      storeId: request.storeId,
      customer: request.customer,
      lineItems: request.lineItems,
      cost: request.lineItems.reduce((sum, item) => sum + item.unitCost * item.quantity, 0),
      shippingMethod: match.supplierShippingMethod,
      notes: request.notes,
      timestamp: new Date().toISOString(),
    };

    this.log("Creating purchase order", { poNumber, supplierId: match.supplierId, orderId: request.orderId });

    // In a complete system we'd send the PO via the supplier's preferred integration.
    // Here we simulate a delivery mechanism and provide a minimal response.

    const response = {
      poNumber,
      status: "sent" as const,
      supplierResponse: {
        deliveredTo: match.supplierContactMethod,
        payload: poPayload,
      },
    };

    this.log("Purchase order sent", { poNumber, supplierContactMethod: match.supplierContactMethod });

    return response;
  }
}
