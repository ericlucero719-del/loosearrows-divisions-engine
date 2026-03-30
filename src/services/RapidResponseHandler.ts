// src/services/RapidResponseHandler.ts

import { RapidResponseEvent } from "../models/RapidResponseEvent";

interface AuditWriter {
  record(event: RapidResponseEvent): Promise<void>;
}

interface AnalyticsEngine {
  ingestFieldEvent(event: RapidResponseEvent): Promise<void>;
}

interface ContractEngine {
  alignFieldEvent(event: RapidResponseEvent): Promise<void>;
}

interface VendorEngine {
  updateFromFieldEvent(event: RapidResponseEvent): Promise<void>;
}

interface LogisticsEngine {
  confirmFieldAction(event: RapidResponseEvent): Promise<void>;
}

export class RapidResponseHandler {
  constructor(
    private auditWriter: AuditWriter,
    private analytics: AnalyticsEngine,
    private contractEngine: ContractEngine,
    private vendorEngine: VendorEngine,
    private logisticsEngine: LogisticsEngine
  ) {}

  async handle(event: RapidResponseEvent) {
    this.validateForgeMark(event);

    if (event.relatedContractId) {
      await this.contractEngine.alignFieldEvent(event);
    }

    if (event.relatedVendorId) {
      await this.vendorEngine.updateFromFieldEvent(event);
    }

    if (event.relatedLogisticsId) {
      await this.logisticsEngine.confirmFieldAction(event);
    }

    await this.auditWriter.record(event);
    await this.analytics.ingestFieldEvent(event);

    return { status: "OK", eventId: event.id };
  }

  private validateForgeMark(event: RapidResponseEvent) {
    if (!event.forgeMark || event.forgeMark.operatorId !== event.operatorId) {
      throw new Error("Invalid Forge Mark");
    }
  }
}
