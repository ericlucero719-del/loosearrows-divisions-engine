import { randomUUID } from "crypto";
import { MultiStoreManager } from "../stores/multiStoreManager";
import { TrackingListener } from "../tracking/trackingListener";
import { PurchaseOrderEngine } from "../po/poEngine";
import { SupplierMatchInput, SupplierMatchResult, SupplierMatchFailure, SupplierInput, StoreRegistryEntry } from "../types";
import { matchSupplier } from "../matching/supplierMatching";
import { prisma } from "../../prisma";

export const storeManager = new MultiStoreManager();
export const trackingListener = new TrackingListener();
export const poEngine = new PurchaseOrderEngine({ logger: (message, meta) => addLog(message, meta) });

// In-memory logs for quick access
export const logs: Array<{ timestamp: string; message: string; meta?: unknown }> = [];

export function addLog(message: string, meta?: unknown) {
  logs.push({ timestamp: new Date().toISOString(), message, meta });
}

export async function getStoreByToken(token: string) {
  if (!token) return null;
  return prisma.store.findFirst({ where: { accessToken: token } });
}

export async function createStore(entry: StoreRegistryEntry) {
  const accessToken = entry.accessToken ?? randomUUID();

  const store = await prisma.store.upsert({
    where: { id: entry.storeId },
    update: {
      name: entry.name,
      url: entry.url,
      accessToken,
      updatedAt: new Date(),
    },
    create: {
      id: entry.storeId,
      name: entry.name,
      url: entry.url,
      accessToken,
    },
  });

  addLog("Store registered", { storeId: store.id });
  return store;
}

export async function updateStoreSettings(storeId: string, settings: Record<string, unknown>) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return null;

  const existingSettings = await prisma.storeSettings.findUnique({ where: { storeId } });
  const newSettings = {
    pricingRulesJson: JSON.stringify(settings.pricingRules ?? existingSettings?.pricingRulesJson ?? null),
    supplierPriorityJson: JSON.stringify(settings.supplierPriority ?? existingSettings?.supplierPriorityJson ?? null),
    shippingRulesJson: JSON.stringify(settings.shippingRules ?? existingSettings?.shippingRulesJson ?? null),
    automationRulesJson: JSON.stringify(settings.automationRules ?? existingSettings?.automationRulesJson ?? null),
    themePresetsJson: JSON.stringify(settings.themePresets ?? existingSettings?.themePresetsJson ?? null),
  };

  const updated = await prisma.storeSettings.upsert({
    where: { storeId },
    update: {
      ...newSettings,
      updatedAt: new Date(),
    },
    create: {
      storeId,
      ...newSettings,
    },
  });

  addLog("Store settings updated", { storeId });
  return updated;
}

export async function loadCatalog(storeId: string, products: any[]) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return null;

  const created = [] as any[];
  for (const product of products) {
    const sku = product.sku ?? product.id;
    if (!sku) continue;

    const upserted = await prisma.product.upsert({
      where: { sku },
      update: {
        title: product.title ?? "",
        description: product.description ?? null,
        imagesJson: product.images ? JSON.stringify(product.images) : null,
        cost: Number(product.cost ?? 0),
        price: Number(product.price ?? 0),
        updatedAt: new Date(),
        storeId,
      },
      create: {
        sku,
        title: product.title ?? "",
        description: product.description ?? null,
        imagesJson: product.images ? JSON.stringify(product.images) : null,
        cost: Number(product.cost ?? 0),
        price: Number(product.price ?? 0),
        storeId,
      },
    });

    created.push(upserted);
  }

  addLog("Catalog loaded", { storeId, count: created.length });
  return created;
}

export async function listSuppliers(storeId?: string) {
  if (storeId) {
    const rels = await prisma.storeSupplier.findMany({
      where: { storeId },
      include: { supplier: true },
    });
    return rels.map((r) => r.supplier);
  }
  return prisma.supplier.findMany();
}

export async function createSupplier(storeId: string, supplier: Partial<SupplierInput>) {
  const createdSupplier = await prisma.supplier.create({
    data: {
      name: supplier.name ?? "",
      contactEmail: supplier.contactEmail,
      apiEndpoint: supplier.apiEndpoint,
      portalUrl: supplier.portalUrl,
      cost: supplier.cost ?? 0,
      stock: supplier.stock ?? 0,
      leadTimeDays: supplier.leadTimeDays ?? 0,
      reliabilityScore: supplier.reliabilityScore ?? 0,
      shippingSpeedDays: supplier.shippingSpeedDays ?? 0,
      location: supplier.location,
    },
  });

  await prisma.storeSupplier.create({
    data: {
      storeId,
      supplierId: createdSupplier.id,
    },
  });

  addLog("Supplier created", { storeId, supplierId: createdSupplier.id });
  return createdSupplier;
}

export async function createOrder(order: any) {
  const created = await prisma.order.create({
    data: {
      id: order.orderId,
      storeId: order.storeId,
      customerJson: JSON.stringify(order.customer ?? {}),
      status: order.status ?? "created",
      items: {
        create: order.lineItems.map((item: any) => ({
          product: {
            connect: { sku: item.sku },
          },
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      },
    },
    include: { items: true },
  });

  addLog("Order created", { orderId: created.id, storeId: created.storeId });
  return created;
}

export async function createPurchaseOrderRecord(poData: any) {
  const created = await prisma.purchaseOrder.create({
    data: {
      poNumber: poData.poNumber,
      orderId: poData.orderId,
      supplierId: poData.supplierId,
      status: poData.status ?? "pending",
      shippingMethod: poData.shippingMethod,
      notes: poData.notes,
    },
  });

  await prisma.purchaseOrderLog.create({
    data: {
      purchaseOrderId: created.id,
      status: created.status,
      message: "Created",
    },
  });

  addLog("Purchase order recorded", { poNumber: created.poNumber });
  return created;
}

export async function updateTracking(orderId: string, update: any) {
  const existing = await prisma.tracking.findUnique({ where: { orderId } });
  const data = {
    carrier: update.carrier,
    trackingNumber: update.trackingNumber,
    status: update.status,
    eta: update.eta ? new Date(update.eta) : null,
    lastScan: update.lastScan ? new Date(update.lastScan) : null,
    location: update.location,
    updatedAt: new Date(),
  };

  const normalized = existing
    ? await prisma.tracking.update({ where: { orderId }, data })
    : await prisma.tracking.create({
        data: {
          orderId,
          ...data,
        },
      });

  addLog("Tracking updated", { orderId });
  return normalized;
}

export async function matchAndSelectSupplier(
  input: SupplierMatchInput
): Promise<{ match?: SupplierMatchResult; failure?: SupplierMatchFailure }> {
  const attemptFn = async (supplier: SupplierInput) => {
    // Simulate an API call to supplier. In a real system this would integrate with supplier's API.
    return { supplierId: supplier.id, acknowledgedAt: new Date().toISOString() };
  };

  const { result, failure } = await matchSupplier(input, attemptFn, { maxRetries: 3 });
  if (result) {
    addLog("Supplier matched", { supplierId: result.supplierId, score: result.score });
  } else if (failure) {
    addLog("Supplier match failed", failure);
  }

  return { match: result, failure };
}
